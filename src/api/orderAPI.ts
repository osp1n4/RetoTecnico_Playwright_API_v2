import { BaseAPI } from './baseAPI';

export class OrderAPI extends BaseAPI {
  async getOrderById(orderId: number) {
    return await this.get(`/v2/store/order/${orderId}`);
  }

  async createOrder(orderData: object) {
    return await this.post('/v2/store/order', orderData);
  }

  async deleteOrder(orderId: number) {
    return await this.delete(`/v2/store/order/${orderId}`);
  }

  async getInventory() {
    return await this.get('/v2/store/inventory');
  }
}

