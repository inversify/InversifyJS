![](https://raw.githubusercontent.com/inversify/inversify.github.io/master/img/cover.jpg)

<p align="center">
	<a href="https://www.npmjs.com/package/inversify" target="__blank"><img src="https://img.shields.io/npm/v/inversify?color=0476bc&label=" alt="NPM version"></a>
	<a href="https://www.npmjs.com/package/inversify" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/inversify?color=3890aa&label="></a>
	<a href="https://github.com/inversify/InversifyJS#-the-inversifyjs-features-and-api" target="__blank"><img src="https://img.shields.io/static/v1?label=&message=docs&color=1e8a7a" alt="Docs"></a>
	<a href="https://codecov.io/gh/inversify/InversifyJS" target="__blank"><img alt="Codecov" src="https://codecov.io/gh/inversify/InversifyJS/branch/master/graph/badge.svg?token=KfAKzuGs01"></a>
	<br>
	<br>
	<a href="https://github.com/inversify/InversifyJS" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/inversify/InversifyJS?style=social"></a>
	<!--<a href="https://twitter.com/inversifyjs" target="__blank"><img alt="Twitter" src="https://img.shields.io/twitter/follow/InversifyJS.svg?maxAge=86400&style=social"></a>-->
	<a href="https://discord.gg/jXcMagAPnm" target="__blank"><img alt="Discord Server" src="https://img.shields.io/discord/816766547879657532?style=social&logo=discord"></a>
</p>

# InversifyJS

A powerful and lightweight inversion of control container for JavaScript & Node.js apps powered by TypeScript.

## About

InversifyJS is a lightweight inversion of control (IoC) container for TypeScript and JavaScript apps.
An IoC container uses a class constructor to identify and inject its dependencies.
InversifyJS has a friendly API and encourages the usage of the best OOP and IoC practices.

## Motivation

JavaScript now supports object oriented (OO) programming with class based inheritance. These features are great but the truth is that they are also
[dangerous](https://medium.com/@dan_abramov/how-to-use-classes-and-sleep-at-night-9af8de78ccb4).

We need a good OO design ([SOLID](<https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)>), [Composite Reuse](https://en.wikipedia.org/wiki/Composition_over_inheritance), etc.) to protect ourselves from these threats. The problem is that OO design is difficult and that is exactly why we created InversifyJS.

InversifyJS is a tool that helps JavaScript developers write code with good OO design.

## Philosophy

InversifyJS has been developed with 4 main goals:

1. Allow JavaScript developers to write code that adheres to the SOLID principles.

2. Facilitate and encourage the adherence to the best OOP and IoC practices.

3. Add as little runtime overhead as possible.

4. Provide a [state of the art development experience](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md).

## Testimonies

**[Nate Kohari](https://twitter.com/nkohari)** - Author of [Ninject](https://github.com/ninject/Ninject)

> _"Nice work! I've taken a couple shots at creating DI frameworks for JavaScript and TypeScript, but the lack of RTTI really hinders things._ > _The ES7 metadata gets us part of the way there (as you've discovered). Keep up the great work!"_

**[Michel Weststrate](https://twitter.com/mweststrate)** - Author of [MobX](https://github.com/mobxjs/mobx)

> _Dependency injection like InversifyJS works nicely_

## Some companies using InversifyJS

[<img src="https://avatars0.githubusercontent.com/u/6154722?s=200&v=4" width="100" />](https://opensource.microsoft.com/)[<img src="https://avatars2.githubusercontent.com/u/69631?s=200&v=4" width="100" />](https://code.facebook.com/projects/1021334114569758/nuclide/)[<img src="https://avatars0.githubusercontent.com/u/2232217?s=200&v=4" width="100" />](https://aws.github.io/aws-amplify/)[<img src="https://avatars0.githubusercontent.com/u/1520648?s=200&v=4" width="100" />](https://www.plainconcepts.com/)[<img src="https://avatars3.githubusercontent.com/u/6962987?s=200&v=4" width="100" />](https://api.slack.com/)[<img src="https://pbs.twimg.com/profile_images/827249559046909954/SyaBPcH8_400x400.jpg" width="100" />](http://acia.aon.com/index.php/home/) [<img src="https://avatars3.githubusercontent.com/u/114767?s=200&v=4" width="100" />](https://www.lonelyplanet.com/) [<img src="https://avatars0.githubusercontent.com/u/25283328?s=200&v=4" width="100" />](https://jincor.com/) [<img src="https://avatars1.githubusercontent.com/u/1957282?s=200&v=4" width="100" />](https://www.web-computing.de/) [<img src="https://avatars1.githubusercontent.com/u/17648048?s=200&v=4" width="100" />](https://dcos.io/) [<img src="https://avatars0.githubusercontent.com/u/16970371?s=200&v=4" width="100" />](https://typefox.io/) [<img src="https://avatars0.githubusercontent.com/u/18010308?s=200&v=4" width="100" />](https://code4.ro/) [<img src="https://user-images.githubusercontent.com/10656223/33888109-fae0852e-df43-11e7-97f6-9db543da0bde.png" width="100">](http://www.baidu.com/) [<img src="https://avatars2.githubusercontent.com/u/8085382?s=200&v=4" width="100" />](https://www.imdada.cn/) [<img src="https://avatars2.githubusercontent.com/u/17041151?s=200&v=4" width="100" />](https://www.ato.gov.au/) [<img src="https://avatars1.githubusercontent.com/u/14963540?s=200&v=4" width="100" />](https://www.kaneoh.com/) [<img src="https://avatars0.githubusercontent.com/u/26021686?s=200&v=4" width="100" />](https://particl.io/) [<img src="https://avatars2.githubusercontent.com/u/24523195?s=200&v=4" width="100" />](https://slackmap.com/) [<img src="https://avatars3.githubusercontent.com/u/16556899?s=200&v=4" width="100" />](https://www.go1.com/) [<img src="https://avatars3.githubusercontent.com/u/23475730?s=200&v=4" width="100" />](http://www.stellwagengroup.com/stellwagen-technology/) [<img src="https://avatars1.githubusercontent.com/u/15262567?s=200&v=4" width="100" />](https://www.edrlab.org/) [<img src="https://avatars1.githubusercontent.com/u/10072104?s=200&v=4" width="100" />](https://www.goodgamestudios.com/) [<img src="https://avatars2.githubusercontent.com/u/13613760?s=200&v=4" width="100" />](https://freshfox.at/) [<img src="https://avatars1.githubusercontent.com/u/864482?s=200&v=4" width="100" />](https://schubergphilis.com/)

## 🧩 Ecosystem

In order to provide a state of the art development experience we are working on:

- [InversifyJS](https://github.com/inversify/InversifyJS/blob/master/apps/inversify)
- [Middleware extensions](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md#extensions).
- [Development tools](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md#development-tools).
- [Examples](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md#examples).

Please refer to the [ecosystem wiki page](https://github.com/inversify/InversifyJS/blob/master/wiki/ecosystem.md) to learn more.

## Support

If you are experience any kind of issues we will be happy to help. You can report an issue using the [issues page](https://github.com/inversify/InversifyJS/issues) or the [chat](https://gitter.im/inversify/InversifyJS). You can also ask questions at [Stack overflow](http://stackoverflow.com/tags/inversifyjs) using the `inversifyjs` tag.

If you want to share your thoughts with the development team or join us you will be able to do so using the [official the mailing list](https://groups.google.com/forum/#!forum/inversifyjs). You can check out the
[wiki](https://github.com/inversify/InversifyJS/blob/master/wiki/readme.md) to learn more about InversifyJS internals.

## Acknowledgements

Thanks a lot to all the [contributors](https://github.com/inversify/InversifyJS/graphs/contributors), all the developers out there using InversifyJS and all those that help us to spread the word by sharing content about InversifyJS online. Without your feedback and support this project would not be possible.
