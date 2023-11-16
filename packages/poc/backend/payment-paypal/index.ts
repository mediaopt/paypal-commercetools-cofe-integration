import * as PayPalActions from './actionControllers/PayPalController';
import * as SettingActions from './actionControllers/SettingController';
import { ExtensionRegistry } from '@frontastic/extension-types';

export default {
  actions: {
    payment: PayPalActions,
    settings: SettingActions,
  },
} as ExtensionRegistry;
