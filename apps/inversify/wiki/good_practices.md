# Good practices

Dependency Inversion (DI) isn't rocket science. 
We just need to try to avoid new and singleton except when there's a compelling reason to use them, 
such as a utility method that has no external dependencies, or a utility class that could not possibly 
have any purpose outside the framework (interoperability wrappers and dictionary keys are common examples of this).

Many of the problems with IoC frameworks come up when developers are first learning how to use them, 
and instead of actually changing the way they handle dependencies and abstractions to fit the IoC model, 
instead try to manipulate the IoC container to meet the expectations of their old coding style, which 
would often involve high coupling and low cohesion.

#### Use a Composition Root to avoid the Service Locator anti-pattern

Our application dependency tree should have one unique root element (known as the application composition 
root) which is the only component where we should invoke the resolve method.

Invoking resolve every time we need to inject something, as if it was a Service Locator is an anti-pattern. 
If we are working with an MVC framework the composition root should be located in the application class, 
somewhere along the routing logic or in a controller factory class.

#### Avoid Constructor over-injection

Constructor over-injection is a violation of the Single Responsibility Principle. Too many constructor 
arguments indicates too many dependencies; too many dependencies indicates that the class is trying to 
do too much. Usually this error correlates with other code smells, such as unusually long or 
ambiguous ("manager") class names.

#### Avoid the injection of data, as opposed to behaviour

Injection of data, as opposed to behaviour, is a subtype of the poltergeist anti-pattern, 
with the 'geist in this case being the container. If a class needs to be aware of the current 
date and time, you don't inject a DateTime, which is data; instead, you inject an abstraction 
over the system clock. This is not only correct for DI; it is absolutely essential for testability, 
so that you can test time-varying functions without needing to actually wait on them.

#### Avoid declaring every life cycle as Singleton

Declaring every life cycle as Singleton is, to me, a perfect example of cargo cult programming and to 
a lesser degree the colloquially-named "object cesspool". I've seen more singleton abuse than I care 
to remember, and very little of it involves DI.

#### Avoid implementation-specific interface types

Another common error is implementation-specific interface types done just to be able to register it in 
the container. This is in and of itself a violation of the Dependency Inversion Principle (just because 
it's an interface, does not mean it's truly abstract) and often also includes interface bloat which 
violates the Interface Segregation Principle.

#### Avoid optional dependencies

In other words, there is a constructor that accepts dependency injection, but also another constructor 
that uses a "default" implementation. This also violates the DIP and tends to lead to LSP violations 
as well, as developers, over time, start making assumptions around the default implementation, and/or 
start new-ing up instances using the default constructor.
