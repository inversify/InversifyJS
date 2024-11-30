import { ClassElementMetadataKind, LegacyTargetImpl } from '@inversifyjs/core';
import { expect } from 'chai';

import { TargetTypeEnum } from '../../constants/literal_types';
import { Container } from '../../container/container';
import { Context } from '../../planning/context';
import { Plan } from '../../planning/plan';
import { Request } from '../../planning/request';

describe('Plan', () => {
  it('Should set its own properties correctly', () => {
    const container: Container = new Container();
    const context: Context = new Context(container);
    const runtimeId: string = 'Something';

    const request: Request = new Request(
      runtimeId,
      context,
      null,
      [],
      new LegacyTargetImpl(
        '',
        {
          kind: ClassElementMetadataKind.singleInjection,
          name: undefined,
          optional: false,
          tags: new Map(),
          targetName: undefined,
          value: runtimeId,
        },
        TargetTypeEnum.Variable,
      ),
    );

    const plan: Plan = new Plan(context, request);

    expect(plan.parentContext).eql(context);
    expect(plan.rootRequest.serviceIdentifier).eql(request.serviceIdentifier);
    expect(plan.rootRequest.parentContext).eql(request.parentContext);
    expect(plan.rootRequest.parentRequest).eql(request.parentRequest);
    expect(plan.rootRequest.childRequests).eql(request.childRequests);
    expect(plan.rootRequest.target).eql(request.target);
  });
});
