import { POST_CONSTRUCT_ERROR } from '../constants/error_msgs';
import { TargetTypeEnum } from '../constants/literal_types';
import * as METADATA_KEY from '../constants/metadata_keys';
import * as interfaces from '../interfaces/interfaces';

function _injectProperties(
  instance: interfaces.IndexObject,
  childRequests: interfaces.Request[],
  resolveRequest: interfaces.ResolveRequestHandler
) {
  const propertyInjectionsRequests = childRequests.filter(
    (childRequest: interfaces.Request) =>
      childRequest.target !== null &&
      childRequest.target.type === TargetTypeEnum.ClassProperty
  );

  const propertyInjections = propertyInjectionsRequests.map(resolveRequest);

  propertyInjectionsRequests.forEach((r: interfaces.Request, index: number) => {
    let propertyName = '';
    propertyName = r.target.name.value();
    const injection = propertyInjections[index];
    instance[propertyName] = injection;
  });

  return instance;
}

function _createInstance(
  Func: interfaces.Newable, injections: unknown[]
): interfaces.IndexObject {
  return new Func(...injections);
}

function _postConstruct(
  constr: interfaces.Newable<unknown>, result: interfaces.IndexObject
): void {
  if (Reflect.hasMetadata(METADATA_KEY.POST_CONSTRUCT, constr)) {
    const data = Reflect.getMetadata(METADATA_KEY.POST_CONSTRUCT, constr);
    try {
      result[data.value]();
    } catch (e) {
      throw new Error(POST_CONSTRUCT_ERROR(constr.name, e.message));
    }
  }
}

function resolveInstance(
  constr: interfaces.Newable<interfaces.IndexObject>,
  childRequests: interfaces.Request[],
  resolveRequest: interfaces.ResolveRequestHandler
): interfaces.IndexObject {
  let result = null;

  if (childRequests.length > 0) {
    const constructorInjectionsRequests = childRequests.filter(
      (childRequest: interfaces.Request) =>
        childRequest.target !== null &&
        childRequest.target.type === TargetTypeEnum.ConstructorArgument
    );

    result = _createInstance(
      constr,
      constructorInjectionsRequests.map(resolveRequest)
    );
    result = _injectProperties(result, childRequests, resolveRequest);
  } else {
    result = new constr();
  }
  _postConstruct(constr, result);

  return result;
}

export { resolveInstance };
