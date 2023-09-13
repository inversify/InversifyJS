import { expect } from 'chai';
import { TargetTypeEnum } from '../../src/constants/literal_types';
import { Container } from '../../src/container/container';
import { interfaces } from '../../src/interfaces/interfaces';
import { Context } from '../../src/planning/context';
import { Request } from '../../src/planning/request';
import { Target } from '../../src/planning/target';

describe('Request', () => {

  const identifiers = {
    Katana: 'Katana',
    KatanaBlade: 'KatanaBlade',
    KatanaHandler: 'KatanaHandler',
    Ninja: 'Ninja',
    Shuriken: 'Shuriken',
  };

  it('Should set its own properties correctly', () => {

    const container = new Container();
    const context = new Context(container);

    const request1: Request = new Request(
      identifiers.Ninja,
      context,
      null,
      [],
      new Target(TargetTypeEnum.Variable, '', identifiers.Ninja)
    );

    const request2 = new Request(
      identifiers.Ninja,
      context,
      null,
      [],
      new Target(TargetTypeEnum.Variable, '', identifiers.Ninja)
    );

    expect(request1.serviceIdentifier).eql(identifiers.Ninja);
    expect(Array.isArray(request1.bindings)).eql(true);
    expect(Array.isArray(request2.bindings)).eql(true);
    expect(request1.id).to.be.a('number');
    expect(request2.id).to.be.a('number');
    expect(request1.id).not.eql(request2.id);

  });

  it('Should be able to add a child request', () => {

    const container = new Container();
    const context = new Context(container);

    const ninjaRequest: Request = new Request(
      identifiers.Ninja,
      context,
      null,
      [],
      new Target(TargetTypeEnum.Variable, 'Ninja', identifiers.Ninja)
    );

    ninjaRequest.addChildRequest(
      identifiers.Katana,
      [],
      new Target(TargetTypeEnum.ConstructorArgument, 'Katana', identifiers.Katana)
    );

    const katanaRequest = ninjaRequest.childRequests[0];

    expect(katanaRequest?.serviceIdentifier).eql(identifiers.Katana);
    expect(katanaRequest?.target.name.value()).eql('Katana');
    expect(katanaRequest?.childRequests.length).eql(0);

    const katanaParentRequest: interfaces.Request = katanaRequest?.parentRequest as Request;
    expect(katanaParentRequest.serviceIdentifier).eql(identifiers.Ninja);
    expect(katanaParentRequest.target.name.value()).eql('Ninja');
    expect(katanaParentRequest.target.serviceIdentifier).eql(identifiers.Ninja);

  });

});