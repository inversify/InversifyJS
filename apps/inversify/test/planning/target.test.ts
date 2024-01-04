import { expect } from 'chai';
import { TargetTypeEnum } from '../../src/constants/literal_types';
import * as METADATA_KEY from '../../src/constants/metadata_keys';
import { Metadata } from '../../src/planning/metadata';
import { Target } from '../../src/planning/target';

describe('Target', () => {

  it('Should be able to create instances of untagged targets', () => {
    const target = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana');
    expect(target.serviceIdentifier).to.be.eql('Katana');
    expect(target.name.value()).to.be.eql('katana');
    expect(Array.isArray(target.metadata)).to.be.eql(true);
    expect(target.metadata.length).to.be.eql(0);
  });

  it('Should be able to create instances of named targets', () => {
    const target = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana', 'primary');
    expect(target.serviceIdentifier).to.be.eql('Katana');
    expect(target.name.value()).to.be.eql('katana');
    expect(Array.isArray(target.metadata)).to.be.eql(true);
    expect(target.metadata.length).to.be.eql(1);
    expect(target.metadata[0]?.key).to.be.eql(METADATA_KEY.NAMED_TAG);
    expect(target.metadata[0]?.value).to.be.eql('primary');
  });

  it('Should be able to create instances of tagged targets', () => {
    const target = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana', new Metadata('power', 5));
    expect(target.serviceIdentifier).to.be.eql('Katana');
    expect(target.name.value()).to.be.eql('katana');
    expect(Array.isArray(target.metadata)).to.be.eql(true);
    expect(target.metadata.length).to.be.eql(1);
    expect(target.metadata[0]?.key).to.be.eql('power');
    expect(target.metadata[0]?.value).to.be.eql(5);
  });

  it('Should be able to identify named metadata', () => {
    const target1 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana', 'primary');
    expect(target1.isNamed()).to.be.eql(true);
    const target2 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana', new Metadata('power', 5));
    expect(target2.isNamed()).to.be.eql(false);
  });

  it('Should be able to identify multi-injections', () => {
    const target1 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana');
    target1.metadata.push(new Metadata(METADATA_KEY.MULTI_INJECT_TAG, 'Katana'));
    expect(target1.isArray()).to.be.eql(true);
    const target2 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana');
    expect(target2.isArray()).to.be.eql(false);
  });

  it('Should be able to match multi-inject for a specified service metadata', () => {
    const target1 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana');
    target1.metadata.push(new Metadata(METADATA_KEY.MULTI_INJECT_TAG, 'Katana'));
    target1.metadata.push(new Metadata(METADATA_KEY.INJECT_TAG, 'Shuriken'));
    expect(target1.matchesArray('Katana')).to.be.eql(true);
    expect(target1.matchesArray('Shuriken')).to.be.eql(false);
  });

  it('Should be able to match named metadata', () => {
    const target1 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana', 'primary');
    expect(target1.matchesNamedTag('primary')).to.be.eql(true);
    expect(target1.matchesNamedTag('secondary')).to.be.eql(false);
  });

  it('Should be able to identify tagged metadata', () => {

    const target = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana');
    expect(target.isTagged()).to.be.eql(false);

    const target1 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana', new Metadata('power', 5));
    expect(target1.isTagged()).to.be.eql(true);

    const target2 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana', 'primary');
    expect(target2.isTagged()).to.be.eql(false);

    const target3 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana');
    target3.metadata.push(new Metadata('power', 5), new Metadata('speed', 5));
    expect(target3.isTagged()).to.be.eql(true);

    const target4 = new Target(TargetTypeEnum.Variable, '', 'Katana');
    target4.metadata.push(new Metadata(METADATA_KEY.INJECT_TAG, 'Katana'))
    expect(target4.isTagged()).to.be.eql(false);

    const target5 = new Target(TargetTypeEnum.Variable, '', 'Katana');
    target5.metadata.push(new Metadata(METADATA_KEY.MULTI_INJECT_TAG, 'Katana'))
    expect(target5.isTagged()).to.be.eql(false);

    const target6 = new Target(TargetTypeEnum.Variable, 'katanaName', 'Katana');
    target6.metadata.push(new Metadata(METADATA_KEY.NAME_TAG, 'katanaName'))
    expect(target6.isTagged()).to.be.eql(false);

    const target7 = new Target(TargetTypeEnum.Variable, '', 'Katana');
    target7.metadata.push(new Metadata(METADATA_KEY.UNMANAGED_TAG, true))
    expect(target7.isTagged()).to.be.eql(false);

    const target8 = new Target(TargetTypeEnum.Variable, 'katanaName', 'Katana');
    target8.metadata.push(new Metadata(METADATA_KEY.NAMED_TAG, 'katanaName'))
    expect(target8.isTagged()).to.be.eql(false);

    const target9 = new Target(TargetTypeEnum.Variable, '', 'Katana');
    target9.metadata.push(new Metadata(METADATA_KEY.OPTIONAL_TAG, true))
    expect(target9.isTagged()).to.be.eql(false);
  });

  it('Should be able to match tagged metadata', () => {
    const target1 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana', new Metadata('power', 5));
    expect(target1.matchesTag('power')(5)).to.be.eql(true);
    expect(target1.matchesTag('power')(2)).to.be.eql(false);
  });

  it('Should contain an unique identifier', () => {
    const target1 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana', new Metadata('power', 5));
    const target2 = new Target(TargetTypeEnum.ConstructorArgument, 'katana', 'Katana', new Metadata('power', 5));
    expect(target1.id).to.be.a('number');
    expect(target2.id).to.be.a('number');
    expect(target1.id).not.eql(target2.id);
  });

});