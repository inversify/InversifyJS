import {
  ClassElementMetadataKind,
  LegacyTargetImpl as TargetImpl,
} from '@inversifyjs/core';
import { expect } from 'chai';

import { TargetTypeEnum } from '../../constants/literal_types';
import { Container } from '../../container/container';
import type { interfaces } from '../../interfaces/interfaces';
import { Context } from '../../planning/context';
import { Request } from '../../planning/request';

describe('Request', () => {
  // eslint-disable-next-line @typescript-eslint/typedef
  const identifiers = {
    Katana: 'Katana',
    KatanaBlade: 'KatanaBlade',
    KatanaHandler: 'KatanaHandler',
    Ninja: 'Ninja',
    Shuriken: 'Shuriken',
  };

  it('Should set its own properties correctly', () => {
    const container: Container = new Container();
    const context: Context = new Context(container);

    const request1: Request = new Request(
      identifiers.Ninja,
      context,
      null,
      [],
      new TargetImpl(
        '',
        {
          kind: ClassElementMetadataKind.singleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          targetName: undefined,
          value: identifiers.Ninja,
        },
        TargetTypeEnum.Variable,
      ),
    );

    const request2: Request = new Request(
      identifiers.Ninja,
      context,
      null,
      [],
      new TargetImpl(
        '',
        {
          kind: ClassElementMetadataKind.singleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          targetName: undefined,
          value: identifiers.Ninja,
        },
        TargetTypeEnum.Variable,
      ),
    );

    expect(request1.serviceIdentifier).eql(identifiers.Ninja);
    expect(Array.isArray(request1.bindings)).eql(true);
    expect(Array.isArray(request2.bindings)).eql(true);
    expect(request1.id).to.be.a('number');
    expect(request2.id).to.be.a('number');
    expect(request1.id).not.eql(request2.id);
  });

  it('Should be able to add a child request', () => {
    const container: Container = new Container();
    const context: Context = new Context(container);

    const ninjaRequest: Request = new Request(
      identifiers.Ninja,
      context,
      null,
      [],
      new TargetImpl(
        'Ninja',
        {
          kind: ClassElementMetadataKind.singleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          targetName: undefined,
          value: identifiers.Ninja,
        },
        TargetTypeEnum.Variable,
      ),
    );

    ninjaRequest.addChildRequest(
      identifiers.Katana,
      [],
      new TargetImpl(
        'Katana',
        {
          kind: ClassElementMetadataKind.singleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          targetName: undefined,
          value: identifiers.Katana,
        },
        TargetTypeEnum.ConstructorArgument,
      ),
    );

    const katanaRequest: Request | undefined = ninjaRequest.childRequests[0];

    expect(katanaRequest?.serviceIdentifier).eql(identifiers.Katana);
    expect(katanaRequest?.target.name.value()).eql('Katana');
    expect(katanaRequest?.childRequests.length).eql(0);

    const katanaParentRequest: interfaces.Request =
      katanaRequest?.parentRequest as Request;
    expect(katanaParentRequest.serviceIdentifier).eql(identifiers.Ninja);
    expect(katanaParentRequest.target.name.value()).eql('Ninja');
    expect(katanaParentRequest.target.serviceIdentifier).eql(identifiers.Ninja);
  });
});
