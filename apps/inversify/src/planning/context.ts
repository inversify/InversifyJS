import { interfaces } from '../interfaces/interfaces';
import { id } from '../utils/id';

class Context implements interfaces.Context {

  public id: number;
  public container: interfaces.Container;
  public plan!: interfaces.Plan;
  public currentRequest!: interfaces.Request;

  public constructor(
    container: interfaces.Container) {
    this.id = id();
    this.container = container;
  }

  public addPlan(plan: interfaces.Plan) {
    this.plan = plan;
  }

  public setCurrentRequest(currentRequest: interfaces.Request) {
    this.currentRequest = currentRequest;
  }

}

export { Context };
