import { POST_CONSTRUCT_ERROR } from '../constants/error_msgs';
import { TargetTypeEnum } from '../constants/literal_types';
import * as METADATA_KEY from '../constants/metadata_keys';
import * as interfaces from '../interfaces/interfaces';
import { Metadata } from '../planning/metadata';

function _injectProperties(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance: any,
  childRequests: interfaces.Request[],
  resolveRequest: interfaces.ResolveRequestHandler
) {
  const propertyInjectionsRequests = childRequests.filter(
    (childRequest: interfaces.Request) =>
      childRequest.target !== null && childRequest.target.type === TargetTypeEnum.ClassProperty
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

function _createInstance(Func: interfaces.Newable<unknown>, injections: Object[]) {
  return new Func(...injections);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _postConstruct(constr: interfaces.Newable<unknown>, result: any): void {
  if (Reflect.hasMetadata(METADATA_KEY.POST_CONSTRUCT, constr)) {
    const data: Metadata = Reflect.getMetadata(METADATA_KEY.POST_CONSTRUCT, constr);
    try {
      result[data.value]();
    } catch (e) {
      throw new Error(POST_CONSTRUCT_ERROR(constr.name, e.message));
    }
  }
}

function resolveInstance(
  constr: interfaces.Newable<unknown>,
  childRequests: interfaces.Request[],
  resolveRequest: interfaces.ResolveRequestHandler
) {
  let result = null;

  if (childRequests.length > 0) {
    const constructorInjectionsRequests = childRequests.filter(
      (childRequest: interfaces.Request) =>
        childRequest.target !== null && childRequest.target.type === TargetTypeEnum.ConstructorArgument
    );

    const constructorInjections = constructorInjectionsRequests.map(resolveRequest);

    result = _createInstance(constr, constructorInjections);
    result = _injectProperties(result, childRequests, resolveRequest);
  } else {
    result = new constr();
  }
  _postConstruct(constr, result);

  return result;
}

export { resolveInstance };
