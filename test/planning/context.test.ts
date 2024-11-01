import { expect } from 'chai';

import { TargetTypeEnum } from '../../src/constants/literal_types';
import { Container } from '../../src/container/container';
import { Context } from '../../src/planning/context';
import { Plan } from '../../src/planning/plan';
import { Request } from '../../src/planning/request';
import { Target } from '../../src/planning/target';

describe('Context', () => {
  it('Should set its own properties correctly', () => {
    const container: Container = new Container();
    const context1: Context = new Context(container);
    const invalid: null = null;
    const context2: Context = new Context(invalid as unknown as Container);

    expect(context1.container).not.to.eql(null);
    expect(context2.container).eql(null);
    expect(context1.id).to.be.a('number');
    expect(context2.id).to.be.a('number');
    expect(context1.id).not.eql(context2.id);
  });

  it('Should be linkable to a Plan', () => {
    const container: Container = new Container();
    const context: Context = new Context(container);
    const target: Target = new Target(TargetTypeEnum.Variable, '', 'Ninja');

    const ninjaRequest: Request = new Request(
      'Ninja',
      context,
      null,
      [],
      target,
    );

    const plan: Plan = new Plan(context, ninjaRequest);
    context.addPlan(plan);

    expect(context.plan.rootRequest.serviceIdentifier).eql('Ninja');
  });
});
