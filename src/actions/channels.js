import { RETRY_DELAY } from '../config';
import { reverse } from '../helpers';
import * as log from './logs';

class ActionsChannels {
  constructor(store, actionsGrpc) {
    this._store = store;
    this._actionsGrpc = actionsGrpc;
  }

  async getChannels() {
    try {
      const { channels } = await this._actionsGrpc.sendCommand('listChannels');
      this._store.channelsResponse = channels.map(channel => ({
        remotePubkey: channel.remote_pubkey,
        id: channel.chan_id,
        capacity: channel.capacity,
        localBalance: channel.local_balance,
        remoteBalance: channel.remote_balance,
        channelPoint: channel.channel_point,
        active: channel.active,
        status: 'open',
      }));
    } catch (err) {
      clearTimeout(this.tgetChannels);
      this.tgetChannels = setTimeout(() => this.getChannels(), RETRY_DELAY);
    }
  }

  async getPendingChannels() {
    try {
      const response = await this._actionsGrpc.sendCommand('pendingChannels');
      const pocs = response.pending_open_channels.map(poc => ({
        channel: poc.channel,
        confirmationHeight: poc.confirmation_height,
        blocksTillOpen: poc.blocks_till_open,
        commitFee: poc.commit_fee,
        commitWeight: poc.commit_weight,
        feePerKw: poc.fee_per_kw,
        status: 'pending-open',
      }));
      const pccs = response.pending_closing_channels.map(pcc => ({
        channel: pcc.channel,
        closingTxid: pcc.closing_txid,
        status: 'pending-closing',
      }));
      const pfccs = response.pending_force_closing_channels.map(pfcc => ({
        channel: pfcc.channel,
        closingTxid: pfcc.closing_txid,
        limboBalance: pfcc.limbo_balance,
        maturityHeight: pfcc.maturity_height,
        blocksTilMaturity: pfcc.blocks_til_maturity,
        status: 'pending-force-closing',
      }));
      this._store.pendingChannelsResponse = [].concat(pocs, pccs, pfccs);
    } catch (err) {
      clearTimeout(this.tgetPendingChannels);
      this.tgetPendingChannels = setTimeout(
        () => this.getPendingChannels(),
        RETRY_DELAY
      );
    }
  }

  async getPeers() {
    try {
      const { peers } = await this._actionsGrpc.sendCommand('listPeers');
      this._store.peersResponse = peers.map(peer => ({
        pubKey: peer.pub_key,
        peerId: peer.peer_id,
        address: peer.address,
        bytesSent: peer.bytes_sent,
        bytesRecv: peer.bytes_recv,
        satSent: peer.sat_sent,
        satRecv: peer.sat_recv,
        inbound: peer.inbound,
        pingTime: peer.ping_time,
      }));
    } catch (err) {
      clearTimeout(this.tgetPeers);
      this.tgetPeers = setTimeout(() => this.getPeers(), RETRY_DELAY);
    }
  }

  async connectToPeer(host, pubkey) {
    await this._actionsGrpc.sendCommand('connectPeer', {
      addr: { host, pubkey },
    });
    await this.getPeers();
  }

  async openChannel(pubkey, amount) {
    const stream = await this._actionsGrpc.sendStreamCommand('openChannel', {
      node_pubkey: new Buffer(pubkey, 'hex'),
      local_funding_amount: amount,
    });
    await new Promise((resolve, reject) => {
      stream.on('data', () => {
        this.getPendingChannels();
        this.getChannels();
      });
      stream.on('end', resolve);
      stream.on('error', reject);
      stream.on('status', status => log.info(`Opening channel: ${status}`));
    });
  }

  async closeChannel(channel, force = false) {
    const stream = await this._actionsGrpc.sendStreamCommand('closeChannel', {
      channel_point: this._parseChannelPoint(channel.channelPoint),
      force,
    });
    await new Promise((resolve, reject) => {
      stream.on('data', data => {
        if (data.close_pending) {
          this.getPendingChannels();
          this.getChannels();
        }
        if (data.chan_close) {
          this._removeClosedChannel(data.chan_close.closing_txid);
        }
      });
      stream.on('end', resolve);
      stream.on('error', reject);
      stream.on('status', status => log.info(`Closing channel: ${status}`));
    });
  }

  _parseChannelPoint(channelPoint) {
    if (!channelPoint || !channelPoint.includes(':')) {
      throw new Error('Invalid channel point');
    }
    return {
      funding_txid_str: channelPoint.split(':')[0],
      output_index: parseInt(channelPoint.split(':')[1], 10),
    };
  }

  _removeClosedChannel(closingTxid) {
    if (!(closingTxid instanceof Buffer)) {
      throw new Error('Invalid closing txid');
    }
    const txid = reverse(closingTxid).toString('hex');
    const pc = this._store.pendingChannelsResponse;
    const channel = pc.find(c => c.closingTxid === txid);
    if (channel) pc.splice(pc.indexOf(channel));
  }
}

export default ActionsChannels;
