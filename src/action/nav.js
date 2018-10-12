/**
 * @fileOverview actions for wrap navigation between views behing a platform
 * independant api. These action should be pretty dumb and only change the
 * route to be rendered in the user interface.
 */

class NavAction {
  constructor(store) {
    this._store = store;
  }

  goLoader() {
    this._store.route.push('/loader');
  }

  goSelectSeed() {
    this._store.route.push('/select-seed');
  }

  goSeed() {
    this._store.route.push('/seed');
  }

  goSeedVerify() {
    this._store.route.push('/seed-verify');
  }

  goRestoreSeed() {
    this._store.route.push('/restore-seed');
  }

  goRestorePassword() {
    this._store.route.push('/restore-password');
  }

  goSeedSuccess() {
    this._store.route.push('/seed-success');
  }

  goSetPassword() {
    this._store.route.push('/set-password');
  }

  goPassword() {
    this._store.route.push('/password');
  }

  goNewAddress() {
    this._store.route.push('/new-address');
  }

  goLoaderSyncing() {
    this._store.route.push('/loader-syncing');
  }

  goWait() {
    this._store.route.push('/wait');
  }

  goHome() {
    this._store.route.replace('/home');
  }

  goPay() {
    this._store.route.push('/payment');
  }

  goPayLightningConfirm() {
    this._store.route.push('/pay-lightning-confirm');
  }

  goPayLightningDone() {
    this._store.route.push('/pay-lightning-done');
  }

  goPaymentFailed() {
    this._store.route.push('/payment-failed');
  }

  goPayBitcoin() {
    this._store.route.push('/pay-bitcoin');
  }

  goPayBitcoinConfirm() {
    this._store.route.push('/pay-bitcoin-confirm');
  }

  goPayBitcoinDone() {
    this._store.route.push('/pay-bitcoin-done');
  }

  goInvoice() {
    this._store.route.push('/invoice');
  }

  goInvoiceQR() {
    this._store.displayCopied = false;
    this._store.route.push('/invoice-qr');
  }

  goChannels() {
    this._store.route.push('/channel');
  }

  goChannelDetail() {
    this._store.route.push('/channel-detail');
  }

  goChannelDelete() {
    this._store.route.push('/channel-delete');
  }

  goChannelCreate() {
    this._store.route.push('/channel-create');
  }

  goTransactions() {
    this._store.route.push('/transaction');
  }

  goTransactionDetail() {
    this._store.route.push('/transaction-detail');
  }

  goNotifications() {
    this._store.route.push('/notification');
  }

  goSettings() {
    this._store.route.push('/setting');
  }

  goSettingsUnit() {
    this._store.route.push('/setting-unit');
  }

  goSettingsFiat() {
    this._store.route.push('/setting-fiat');
  }

  goCLI() {
    this._store.route.push('/cli');
  }

  goCreateChannel() {
    this._store.route.push('/create-channel');
  }

  goDeposit() {
    this._store.displayCopied = false;
    this._store.route.push('/deposit');
  }

  goBack() {
    this._store.route.goBack();
  }
}

export default NavAction;
