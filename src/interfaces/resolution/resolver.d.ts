/// <reference path="../planning/plan.d.ts" />

interface IResolver {
    resolve<Service>(context: IContext): Service;
}
