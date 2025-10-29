import { OrderAPI } from '../api/orderAPI';

export const testContext: {
  requestContext?: any;
  api?: OrderAPI | undefined;
  response?: any;
  currentOrder?: any;
} = {};

export default testContext;
