import { ActionContext, Request, Response } from '@frontastic/extension-types/src/ts/index';
import { getCurrency, getLocale } from '@Commerce-commercetools/utils/Request';

import { SettingApi } from '../apis/SettingApi';

export const getPayPalSettings = async (request: Request, actionContext: ActionContext) => {
  const settingApi = new SettingApi(actionContext.frontasticContext, getLocale(request), getCurrency(request));

  const settings = await settingApi.getSettings();

  const response: Response = {
    statusCode: 200,
    body: JSON.stringify(settings),
    sessionData: request.sessionData,
  };
  return response;
};
