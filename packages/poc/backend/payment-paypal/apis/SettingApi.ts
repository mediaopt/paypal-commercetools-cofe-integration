import { BaseApi } from '../../commerce-commercetools/apis/BaseApi';

export class SettingApi extends BaseApi {
  getSettings: () => Promise<{ [key: string]: boolean | string }> = async () => {
    const settings = await this.requestBuilder()
      .customObjects()
      .withContainerAndKey({ container: 'paypal-commercetools-connector', key: 'settings' })
      .get()
      .execute()
      .then((response) => {
        return response.body;
      })
      .catch((error) => {
        throw error;
      });

    return settings.value;
  };
}
