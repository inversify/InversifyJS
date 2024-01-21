# Create your own tag decorators

Creating your own decorators is really simple:

```ts
let throwable = tagged("canThrow", true);
let notThrowable = tagged("canThrow", false);

@injectable()
class Ninja implements Ninja {
    public katana: Weapon;
    public shuriken: Weapon;
    public constructor(
        @inject("Weapon") @notThrowable katana: Weapon,
        @inject("Weapon") @throwable shuriken: Weapon
    ) {
        this.katana = katana;
        this.shuriken = shuriken;
    }
}
```

If you need to create a reusable decorator for multiple tags:

```ts
function moodReason(mood:string, reason: string) {
    return createTaggedDecorator([{key:"mood",value:mood},{key:"reason",value:reason}]);
}
const happyAndIKnowIt = moodReason("happy","I know it");
const dontLikeMondays = moodReason("miserable","I don't like Mondays");

@injectable()
class MoodyNinja {
    public constructor(
        @inject("Response") @happyAndIKnowIt clapHands: Response,
        @inject("Response") @dontLikeMondays shootWholeDayDown: Response
    ) {
        //....
    }
}
```
