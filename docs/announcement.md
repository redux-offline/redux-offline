Blog

Introducing Redux Offline: Offline-First architecture for Progressive Web Applications and React Native

This post is a long-form trip report from the depths of building offline-friendly web and mobile applications. If you’re looking to discover how to get started with Offline-First apps, I recommend taking the time to read this. If you’re in a rush, or are just looking for a solution for a problem you’ve already identified you have, head over to the Redux Offline repository and follow the Readme to get started.

Learn from my mistakes

Two years ago, I made my first mobile app with React Native. For the most part it looked like a real app. You could swipe it. You could tap it. It received push notifications. It had all the bells and whistles you would expect from a mobile app, and being a web developer, I was pretty darn satisfied myself, putting out a real mobile app *just like that*.

But then people started using the app, and I started to hear feedback from our users. “This app sucks! Why does it tell me I’m not connected to a network! “I don’t care about the network, I just want to see my pictures!” Turns out, I made the app look like a real app, but it didn’t behave like one in one important regard: It wasn’t built with network-resiliency in mind.

It was a stupid rookie mistake, and I quickly fixed it, but the mistake stuck with me, and I became obsessed with discovering the right way of doing offline-capable apps with React.

Of course, there isn’t only one right way, but a with few more offline-capable React apps under my belt I’ve discovered one that works well, and I want to share it here.

Moving targets

Many of you are about to have the same experience I did. Thanks to the ServiceWorker API, so called Progressive Web Apps are now able to work offline.

Two years ago, I was a rookie mobile developer crossing over to mobile. This year, or next year, many more web developers will be writing their first mobile applications, and the same lessons I learned the hard way in React Native are relevant to PWAs.

In general, we will start to see increasing cross-pollination between the mobile and web development fields. To create successful mobile apps that not only look like real apps, but behave like them, web developers will need to discover new patterns and practices.

But before we get to those patterns, there is another reason why offline support is important today.

Emerging markets

Today, a bit over 1 billion people have access to high-speed internet. 3 billion have some access to the web. Over 5 billion people own a mobile phone. Every single year. more people will be gaining access to the internet. Most of them will be mobile users, connected via low-speed, intermittent connections.

For these people, offline support is not a luxury, it is basic accessibility.

But let’s say you don’t care about their accessibility. Or perhaps you care, but whoever pays you to develop apps doesn’t. It’s a hard sell to ask them to invest their precious engineering resources to stand in solidarity with people half the world over.

But here’s the thing. Many of the users gaining access to the internet are simultaneously graduating into the middle class, with increasing incomes, and they represent a huge opportunity for globalized internet businesses.

Furthermore, investing in offline-first appications will benefit all your users. I live in London, and while networks and devices are miles better here, there are still great reasons to make your apps offline-first. Even in 3G and 4G networks, latency is still terrible, and offline-first applications have better perceived performance. All networks still occasionally fail or become our of reach, and offline-first apps can offer a better user experience.

To summarize, while accessibility and democratised access to the internet are important goals, for businesses there is no stronger motive than the profit motive. Creating rich web and app experiences for the emerging markets require us to apply offline-first engineering practices - and those practices will benefit all your users, not just those in poor network conditions.

How do?

So, now that we’ve established that offline support is a good idea, let’s talk about how we’re going to make it happen. There are many ways to skin the cat.

if online then … else …

The simplest imaginable way is simply to check if you’re online, and branch out your program logic accordingly. But of course, you can see how this method is very primitive, hard to test, and will snowball out of control real quick.

The most important issue with this approach is that in real-world mobile network conditions it’s impossible to really detect when you are online. Network state is not a binary true of false. Your mobile receiver might be technically connected to the network, but not able to reach the remote server. Or the connection lags, glitches or hangs so badly that you are effectively offline no matter what the operating system says. And finally, network access is volatile and non-atomic. If you check that you’re online right now, by the time you fire your request, the reality may have changed. So the only real way is to try to do the thing, and be resilient about failures.

Read-through network cache

If network is the problem, perhaps we can solve the problem at the networking layer? If a network request succeeds, serve fresh data and cache it for later. If it fails, serve cached data from the fallback store. At first look, this would seem to work really well with the ServiceWorker Cache API, but it turns out these kinds of caches are hard to manage, and not very flexible. Further, this kind of caching doesn’t naturally lend its support for mutations. You can only cache data fetching, but it’s very hard to implement network-resilient updating of your state at the networking layer.

Database synchronisation

A more advanced solution is to implement offline support at the level of your storage abstraction. Couldn’t we just save data into a database, and let the database figure out how to synchronise it to the backend?

There are many great tools for this. PouchDB synchronises to a server-side CouchDB. The Realm platform, an end-to-end synchronization solution released by the mobile database product company by the same name last year, does an excellent job at this for native apps. Datomic for Clojure is a dazzling feat of engineering.

I find these solutions fantastic and exciting — when they. Data store synchronization tends to be easy to use at first, but the mechanisms are not easy to reason about or approachable to modify.

For most use cases, the final nail to the coffin of data store synchronization is that it requires you to design your backend around a special-case database product. Most apps developers, and certainly not consultants like us at Formidable, are able to justify building an entire systems architecture to make your apps work offline.

Shopping list

When I started to research how do offline apps in React, I laid our a few requirements.

1. I wanted a solution that doesn’t force me to adopt a whole new paradigm of data synchronisation or backend.
2. I wanted something that most React developers on my team are already familiar with and can implement reliably, and reason about the mechanisms.
3. I wanted a solution that works universally in native mobile apps, mobile browsers and desktop browsers.
4. I wanted a solution that wouldn’t break in the face of arbitrary requirements 
    - Read-only offline support is a good start, but more often than not you need Read-Write network resilience.
    - Mostly you want to have your app support optimistic updates, but other times you need pessimistic UI state and even a audit log of unsynchronised changes.
    - Mostly it’s enough to lazily and incrementally cache your data, but sometimes you need eager, up-front data loading.
    - Background synchronisation is a complex requirement, but often it’s a must-have requirement, so an architecture should be flexible enough to support it.
    - The offline cache should be able to survive app updates, which means we need to have a simple way of migrating our database schema between versions.

That’s a long list of requirements. Which database product can fulfil them? What kind of application architecture does it naturally yield?

Turns out, we already have the primary toolkit in our disposal.

Redux

By now, most React developers have used Redux, and feel comfortable building apps with it.

In some circles, Redux gets a bad rap these days. “Too much boilerplate”, “too much ceremony”, “too verbose”. At least a dozen, almost identical blog posts have been written about how much easier and less verbose it is to write apps with MobX.

While MobX is a great tool, as with any argument that’s based on the measurement of lines of code, some of these article miss the point.
 Redux is not great for making simple things quickly. It’s great for making really hard things simple.

Simple, like this:

Architecture diagram

Here is the basic mechanism that I’ve successfully deployed in multiple applications, and has proven flexible and simple enough. There are, though, a few moving parts.

The basic idea is that your redux store is your database. You serialize and persist your store when it changes, and when your app starts, you read it back into memory. The storage mechanism doesn’t really matter much, but in the browser you can use localStorage or IndexedDB, and in React Native you can use AsyncStorage, or roll your own.

Any action that you need to work offline needs to be persisted alongside with your store, and your app should know how to continue processing those actions after a restart. This means that we cannot rely on any in-memory state, and the entire context required for synchronizing those actions needs to be stored alongside the action.

In this architecture, offline-supported actions are decorated with an offline meta field that describes how the network effect should be performed, what action should be fired when it succeeds, or when it fails. The offline actions are then queued up, and sent to the server once online. How, where and when they are sent can vary.

This architecture is not novel. I discovered it piece by piece while researching how to do offline right, and others have discovered similar patterns before. About 70% of this architecture can be implemented fully with existing middleware. In particular, redux-persist is a fantastic library for all your persistence-related needs, and redux-optimist is gives general support for optimistic actions.

But, as always, the devil is in the details. The interop between different middleware can get really complex, and there is still a lot of functionality that you’ll need to implement yourself. And worse of all, the path to a successful offline strategy using these libraries is not documented anywhere.

Which finally gets us to…

Redux Offline

I’m excited to announce here today, a brand-new, one-stop solution for creating Offline-First apps for web and React Native.

Redux Offline is a small, modular library that provides full support for offline-first applications. It’s aimed to be easy to use, work with any backend API, and you can take it into use in your application in less than 30 minutes.

The implementation available to install from npm today is new and experimental, but it’s based on a reliable and battle-tested pattern. This is a first release out of many, and with your feedback I hope to make it the best solution for creating offline web apps.

Notice that I didn’t say React apps. Redux Offline has no dependency on React. Redux Offline is a small, standalone, persistent state container that works with any web application that is able to render itself declaratively based on a single source of data, including React, Angular 2, Vue, Preact, and Inferno.

So, what does it do?

Redux Offline aims to give a granular degree of control on all aspects of the offline-first experience. This includes how to orchestrate network-resilient API calls, how to persist your state, how to batch messages, how to handle errors, retries, optimistic UI updates, migrations, cache pruning, and more.

If that sounds complicated, it’s because it can be. That is why Redux Offline aims to provide a sensible set of default behaviours that you can start using, and override one by one as needed, while continuing to take advantage of the core orchestration capabilities of the library.

How to use it?

In a rare turn, the feature of Redux Offline I’ve spent the most time refining before launch is the documentation. Offline-first applications are not rocket science, and I’m not a rocket scientist. Fundamentally, the problem Redux Offline solves is not an engineering problem, but an architecture problem. Architectures can be implemented in code, but in order to be understood, adopted and followed, they need to be well communicated.

So, instead of explaining the basic mechanism here, head over to the Redux Offline repository to learn the API and how to take Redux Offline into use in your application.

In closing

Whether or not you’ve already made your first offline-capable React or React Native app, most web developers will face this problem in the future.

As I hope I’ve shown here, offline-capability doesn’t need to be rocket science. You don’t necessarily need a database product, and you don’t need to give up the architecture you’re familiar with. The hard part is not writing the code to make your app work offline, but to apply a pattern that is powerful and flexible enough to survive the churn of evolving software requirements

I hope that Redux Offline can be helpful to you. Go try it out and tell me what you think.
