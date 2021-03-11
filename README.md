# Link-Redux
*A Link to the Web*

[![CircleCI](https://img.shields.io/circleci/build/gh/fletcher91/link-redux)](https://circleci.com/gh/fletcher91/link-redux)
[![Read the Docs](https://img.shields.io/readthedocs/pip.svg)](https://fletcher91.github.io/link-redux/)
![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/fletcher91/link-redux)
![Code Climate coverage](https://img.shields.io/codeclimate/coverage/fletcher91/link-redux)
![npm version](https://img.shields.io/npm/v/link-lib.svg)
![npm type definitions](https://img.shields.io/npm/types/link-redux.svg)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

Link-Redux (or Link) helps you render [Linked Data](https://ontola.io/what-is-linked-data/) (RDF) in React.

## [Docs](https://fletcher91.github.io/link-redux/): functions, classes, methods, types
## [Reference](https://github.com/fletcher91/link-redux/wiki): how to use Link

## Features
- RDF data fetching & parsing, using [rdflib.js](https://github.com/linkeddata/rdflib.js/)
- View management (error & loading handling, smart lookups, adapts to data)
- Rule-based inference engine to determine which View is suitable
- Actions / Data manipulation (in a flux pattern, like redux, but with [server-side actions](https://github.com/fletcher91/link-lib/wiki/Hypermedia-API))

## When you'd might want to use Link
- Embedding Linked Data into your existing app
- [SOLID](https://github.com/solid/solid) apps
- Multi-domain linked-data browsers
- Full Rest-in-Rest hypermedia systems

## Rendering a Person
Say we want to render this bit of linked data:

```turtle
<https://example.com/somePerson> a <http://xmlns.com/foaf/0.1/Person> .
<https://example.com/somePerson> <http://schema.org/name> "Jane Doe" .
<https://example.com/somePerson> <http://schema.org/birthPlace> <http://dbpedia.org/page/London> .
```

In our app we create a `Resource` to render our subject:

```javascript
import Resource from "link-redux"

<App>
  <Resource subject="https://example.com/somePerson" />
</App>
```

Now, Link will try to fetch our subject and will show a Loading component.
If it fails, an Error component will render.
If it succeess, Link will look for the best possible registered view.
Currenlty, no views are registered, so we'll need to register one:

```javascript
// We don't have to type out the URLs for the ontologies
import * as schema from "@ontologies/schema"
import { Person } from "@ontologies/foaf"
import { register } from "link-redux"

const MyPersonView = ({ birthPlace, name }) => (
  <div>
    <p>{name.value}</p>
    <Resource subject={birthPlace} />
  </div>
)

// Here we tell Link that this component is suited for rendering a foaf:Person
MyPersonView.type = Person // => http://xmlns.com/foaf/0.1/Person
// mapDataToProps makes the property values available in the component
MyPersonView.mapDataToProps = {
   birthPlace: schema.birthPlace,
   name: schema.name
}
// The component is registered as a View in Link
register(MyPersonView)
```

That's it! There's a lot more you can do with Link, though.
You can create custom Property renderers, dispatch actions, and specify which views should render where using Topologies.

## Usage
`npm install link-lib link-redux rdflib` V `yarn add link-lib link-redux rdflib`

### Example apps & related repositories
- See the [TODO app](https://fletcher91.github.io/link-redux-todo/#/) for a live example and [the source](https://github.com/fletcher91/link-redux-todo) for the implementation. Mind that it isn't connected to a back-end, so it's only a demo for the view rendering mechanism.
- [ori-search](https://github.com/ontola/ori-search/) uses Link to render Dutch Government meetings.
- [mash](https://github.com/ontola/mash) is a databrowser, compatible with SOLID

## Architecture
First off, only very basic knowledge of the underlying technologies (RDF and REST) is required to build
applications with Link. It'll provide you with the benefits of hypermedia, while abstracting some of
the difficulties.

Link was designed to work with RDF and REST (including [HATEOAS](https://en.wikipedia.org/wiki/HATEOAS))
principles, therefore it has a different architecture than the general react app. This is in large part
due to the [open world assumption](http://www.dataversity.net/introduction-to-open-world-assumption-vs-closed-world-assumption/)
causing us to handle uncertainty about the shape of the data that we're going to get from the server.

Though it's easy to just render a table and call it a day, to create rich, interactive applications,
we have to make _some assumptions_ about the data, but when building a Link application, you should
still be able to render data from a variety of data sources while being able to tune UX for the most
important use-cases.

Due to those constraints, part of the application logic resides in the views themselves. There are
different types of views to handle the different use cases which the constraints impose.

### Topology providers
Think of these as UI API definitions. These should set the UI limits of a component, and the general
props that can be passed to them.

To identify the different topologies in your app. Take a look at your design and identify the places
where data is rendered in different formats. Well known UI-library components (article, button,
list item, table cell) should come to mind, as well as components specced in wire frames (page, menu,
sidebar, hover popup, etc). Over time, as your app develops, these can become quite plentiful. If
there are too many, consider redesigning some parts to simplify its core structure.

Let's take the last one, hover bubble. A user hovers over a link and a bubble should appear with a
preview.

```JSX Harmony
import { TopologyProvider } from 'link-redux';

/**
 * Define an IRI for the topology. It's handy to use the app namespace since the topology is probably
 * app specific. However, when building a UI library, an iri of that library would be more useful
 * since the layout requirements (css) of each component would be fully documented.
 */
export const popupTopology = app('topologies/popup');

/**
* This component is to set the topology. In the real world, it'd be used in a component which
* manages the portal to render the popup. Documentation can be used to define which props can be
* expected by components rendered under this topology. In this case a `close` method for closing the
* popup could be useful.
*/
class Popup extends TopologyProvider {
  constructor(props) {
    super(props);

    // Set the topology for all children to the newly defined.
    this.topology = popupTopology;
    // It's possible to set a class name on the wrapping component.
    this.className = 'Bubble--container';
  }

  // The render method is completely optional
  render() {
    // Since a popup always renders a new resource, we'll override rendering to set a new
    // microdata context.

    // This property also works out of the box, defaulting to a div.
    const elem = this.elementType;

    return this.wrap((subject) => {
       <elem className={this.className} resource={subject && subject.value}>
         {this.props.children}
       </elem>
    });
  }
}
```

Mounting this component in the tree will cause any child to be resolved in the new topology. Be sure
to register a component with it, otherwise no view can be found an an error will occur.
appropriate format.

### Resource renderers
To tell link to fetch and render a resource, just mount a `Resource` anywhere
in your react app. Because the component will try to render every IRI passed, a good place for the
initial mount would be in the router, especially the fallback route. If choosing to use the Resource
as a router, make sure all your resources are resolvable (including the fragment), otherwise a 404
will occur.

```JSX Harmony
import rdf from '@ontologies/core'
import { namedNodeByIRI, Resource } from 'link-redux';

class OurTeamPage extends React.PureComponent {
  /* details omitted */

  render() {
    /**
    * We use `Grid` here to communicate to the resolved views what their environment is, based on
    * the registered views for their class (probably <schema:Person>) they'll probably render as a
    * card with their profile picture, name and a small description.
    *
    * The {Resource} component expects `subject` to be an instance of rdflib/NamedNode. Obtain one by either:
    * - Using a namespace, e.g. app('person/alice')
    * - Using namedNodeByIRI to get one from a string
    *
    * NOTE: Using new NamedNode() from rdflib WILL NOT WORK(!) due to implementation details.
    */
    return (
      <div>
        <h1>Our team:</h1>
        <Grid>
            <Resource subject={app('person/alice')} />
            <Resource subject={rdf.namedNode('https://example.com/person/bob')} />
        </Grid>
      </div>
    );
  }
}
```

So all the underlying logic of managing API calls, data fetching, views selecting etc will be
handled by the `Resource` component. To show a loading indicator (or an error) for
grid mounted resources while alice and bob are loading, see [Loading and error handling](https://github.com/fletcher91/link-redux#loading-and-error-handling).

### Property renderers
Property renderers are akin to resource renderers, but they work with one or more properties of a
resource, rather than an entire resource. This can be useful in a diverse range of use cases;
* When wanting to separate the main resource implementation from property rendering to keep individual components clean.
* When the range (value) of a property isn't known yet - e.g. it could be a number or an entire nested resource.
* When a range of similar properties is appropriate in a location, but only one should be displayed - e.g. <schema:name>, <rdfs:label>, <foaf:name>
* When combining multiple properties into a single view - e.g. geo-coordinates (latd, latm, latns, longd, longew, longm)

When a property has no view registered, and the resolved value is a NamedNode (a link/href), it'll
automatically mount a Resource so the nested resource is rendered.

```JSX Harmony
import * as foaf from '@ontologies/foaf';
import * as schema from '@ontologies/schema';
import { Property } from 'link-redux';

const nameTypes = [schema.name, foaf.name];

class PersonGrid extends React.PureComponent {
  /* details omitted */

  render() {
    // The label defines which properties we like to render.
    return (
      <div>
        <Property label={[schema.name, foaf.name]} />
      </div>
    )
  }
}


class PersonName extends React.PureComponent {
  /* details omitted */

  render() {
    // The value of the property is passed to property renderers as `linkedProp`, note that it is a
    // RDFLib Literal object, to get the string representation call `linkedProp.value` e.g. 'Alice'
    return (
      <p>{this.props.linkedProp.value}</p>
    );
  }
}
```

#### Actions and the Middleware
So far we have seen how to render the data, but applications wouldn't be complete without
interactivity.

Traditionally web applications differentiate between actions which modify client state (e.g. showing
a popup) and those which modify server state (e.g. doing a POST requests). Server actions can be
characterised by the URL to send the request to, together with some optional request body. The
client side is more diverse (i.e. using events, passing callbacks, redux's action system, etc.) but
link re-uses the server-side interface for modifying client state as well, all actions written with
the tools link provides can be executed by providing the system with an URL and an optional body.

Constraining client actions to be able to be described via URLs (and an optional body) might seem
somewhat cumbersome, but it enables some very interesting behaviour. It allows rendering both server
data and client state with the same tools, as well as allowing the the logic which is needed to
fulfill the action between client and server without breaking the system.

To execute an action, just call `lrs.exec(iri: NamedNode, payload: any)`. By default link will search
the store for the resource (`iri`) or fetch it if it doesn't exists, if the resource is some
[schema:Action](https://schema.org/Action) it will try and fulfill the request, updating the store
with the changes the server requested (see the the
[hypermedia API documentation](https://github.com/fletcher91/link-lib/wiki/Hypermedia-API) for more
info).

The exec method is a middleware function with a handler for doing http requests (via schema:Action
resources) pre-installed. You can add your own handlers to the stack to implement behaviour for other
URLs or to override the default behaviour.

Furthermore, if the server responds with the `Exec-Action` header, the server can execute an action
in the front-end (e.g. trigger some popup to perform a required action). This is what sets it apart
from just using redux for state management, since it allows the front-end to execute actions on far
more data than a client device could calculate, resulting in more powerful experiences without
duplicating logic as well.

The following example implements the state management for a popup, the `processDelta` calls are used
to change the state. The syntax is somewhat verbose for middleware this size, but the overhead is
acceptable for real-world implementations, since you shouldn't need a lot of these methods (most
actions should be handled automatically with the hypermedia API).

```JSX Harmony
// src/ontology/popup.js
import { createNS } from '@ontologies/core';

// Define a new namespace for our popup system
const ns = createNS("https://mySite.com/ns/popup#");

// Define some classes, properties, and individuals within our ontology.
export default {
  ns,

  /* Classes */
  PopupManager: ns('PopupManager'),

  /* Properties */
  resource: ns('resource'),
  open: ns('open'),
  close: ns('close'),

  /* Individuals */
  manager: ns('manager'),
}
```

```JSX Harmony
// src/middleware/popup.js
import rdf, { createNS } from '@ontologies/core';
import * as rdfx from '@ontologies/rdf';
import { replace } from '@rdfdev/delta';  // See https://github.com/argu-co/linked-delta for the exact meaning
import popup from '../ontology/popup';

const PopupMiddleware = (store) => {
  // Make the namespace available throughout the app
  // Set up the state in the store, e.g. which resource to render and if it should be shown
  store.processDelta([
    replace(
      popup.manager,
      rdfx.type,
      popup.PopupManager,
    ),
    replace(
      popup.manager,
      popup.resource,
      popup.null,
    ),
    replace(
      popup.manager,
      popup.open,
      rdf.literal(false),
    ),
  ]);

  /**
  * A helper function which defines how the state should be modified.
  */
  const showPopup = (iri) => store.processDelta([
      replace(
        popup.manager,
        popup.resource,
        rdf.namedNode(iri),
      ),
      replace(
        popup.manager,
        popup.open,
        rdf.literal(true),
      ),
    ]);

  const hidePopup = () => store.processDelta([
      replace(
        popup.manager,
        popup.open,
        rdf.literal(false),
      ),
    ]);

  //  It's useful to always return a promise (e.g. use `async` if you have ESnext), so the caller
  //  can do stuff after the middleware is done.
  return next => (iri, opts) => {
    // Skip non-popup actions
    if (!iri.value.startsWith(popup().value)) {
      return next(iri, opts);
    }

    // Display a popup
    if (iri.value.startsWith(iri.value.startsWith(popup.show.value))) {
      const resource = new URL(iri.value).searchParams.get('resource');

      return showPopup(resource);
    }

    // Its a popup action, but not a display, so default to hiding
    return hidePopup();
  };
};
```

After setting up, you can wrap your favorite popup library with the `link` method to retrieve the
state from the store;

```JSX Harmony
// Mount `<Resource subject={popup.manager} />` somewhere in your app

import { Resource } from 'link-redux';
import popup from '../ontology/popup';

class PopupManager extends React.PureComponent {
  static type = popup.PopupManager;

  static mapDataToProps = [popup.resource, popup.open];

  render() {
    const { open, resource } = this.props;

    if (open.value === 'false') {
      return null;
    }

    // The <Popup /> wrapper here is a TopologyProvider. If we were lazy, we could omit this and set
    //  the `topology` prop on Resource, but consistency is maintainability.
    return (
      <PopupLibrary>
        <Popup>
          <Resource
            close={this.props.lrs.exec(popup.close)}
            subject={resource}
          />
        </Popup>
      </PopupLibrary>
    );
  }
}

export default register(PopupManager);
```

## Basic Usage

### 1. Set up the store
Create a helper to set up an instance of [the `LinkedRenderStore`](https://fletcher91.github.io/link-lib/classes/linkedrenderstore.html)
to use in your application;
```javascript
// src/LRS.js
import { createNS } from '@ontologies/core';
import { createStore, DEFAULT_TOPOLOGY } from 'link-lib';
import { FRONTEND_URL } from './config';

/**
* We have a helper function to initialize the store, the first param is config (default should
* suffice), the second is an array of middleware, the default terminating middleware calls the
* schema:Action executor [`LRS#execActionByIRI`](https://github.com/fletcher91/link-lib/wiki/Hypermedia-API).
*/
const LRS = createStore({}, [
  /**
  * This middleware logs all actions passed.
  * _lrs The live store once initialized.
  * next The next middleware, not calling this will terminate the middleware flow for that action.
  * (a, o) The action IRI and an unspecified payload respectively.
  */
  (lrs) => next => (a, o) => {
      console.log(`Link action '${a}' passed down`);
      return next(a, o);
    },
]);

/**
 * If the app is programmed for a specific backend, it's useful to add it to the namespaces so that
 * it can be used for (hard-coded) entry points.
 */
const api = createNS(FRONTEND_URL);

/**
 * Set up your own namespace for (virtual) app-specific properties (this might be the same as the
 * api). These SHOULD NOT be shared and have app-specific semantics.
 *
 * Virtual properties are useful for creating behaviour separate from data-source, while still using
 * the same interface.
 */
const app = createNS(FRONTEND_URL);

/**
* It's useful to have a central source of valid application topologies. This also provides a
* location to document the intended usage.
*
* A common issue when beginning with link is forgetting to set the correct topology(ies), so
* defaulting to registering views under all topologies can prevent a lot of headaches. Mind that
* over-registering might cause the wrong view to be rendered rather than none at all.
*/
export const allTopologies = [
  // Generally used to mean that the resource is the main content on the page.
  DEFAULT_TOPOLOGY,
  // The resource/property is rendered within the navigation menu (e.g. as a `li`)
  app('navigation'),
  // The resource/prop is rendered in a table (e.g. as a single row within the table).
  app('table'),
  // The resource/prop is rendered in a row (e.g. as a single cell within the row).
  app('row'),
  // The resource/prop is rendered in a cell (e.g. as a raw value or some small representation).
  app('cell'),
];

/**
* Include this function so you can't forget a topology by registering all but those explicitly
* handled by other components.
*/
export function allTopologiesExcept(...topologies) {
  const filtered = allTopologies.slice();
  topologies.forEach((t) => {
    const i = filtered.indexOf(t);
    if (i !== -1) {
      filtered.splice(i, 1);
    }
  });

  return filtered;
}

export default LRS;
```

### 2. Add some views
Write some views to render resources:

```JSX harmony
import * as schema from '@ontologies/schema';
import LinkedRenderStore from 'link-lib';
import { link, register, Property, Resource } from 'link-redux';
import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import { NS } from './LRS';

class Thing extends React.PureComponent {
  static type = schema.Thing;

  /**
  * This function automatically wraps your component with the `link` method to bind your component
  * to store data (like `connect` in redux).
  */
  static mapDataToProps = [
    schema.text,
    schema.creator,
  ];

  render() {
    const { creator, text } = this.props;

    return (
      <div>
        <Property label={schema.name}/> // Delegate the rendering of the name to another dynamically resolved component
        <p>{text.value}</p>
        <Resource subject={creator} />
      </div>
    );
  }
}

class ThingNavigation extends React.PureComponent {
  static type = schema.Thing;

  static mapDataToProps = [schema.name];

  static topology = app('navigation');

  static linkOpts = {
    returnType: 'value', // We don't need the objects, just their values for this view, see {link} for all options.
  };

  render() {
    // The `subject` prop is always given to rendered views so it can link to itself.
    const { name, subject } = this.props;

    return (
      <li>
        <Link to={subject}> // Not to be confused with the {link} HOC.
          {name}
        </Link>
      </li>
    );
  }
}

/**
* Properties without being connected via the `link` function recieve their prop's value via `linkedProp`
*
* As you can see, components don't have to be classes, but can be function components as well.
*/
const ThingName = ({ linkedProp }) => <h1>{linkedProp.value}</h1>;

ThingName.type = schema.Thing;
ThingName.property = schema.name;
/**
 * We'll bind all known topologies to this component, rather than the larger components since it has
 * less chance to overflow out of bounds.
 * We can use `undefined` here as a shortcut for the default as well (bound to the `Thing` component).
 */
ThingName.topology = allTopologiesExcept(undefined, app('navigation'), );

// We want to show whether it's the users' birthday
const PersonName = ({ birthDay, name }) => {
  const birthdayIcon = isToday(birthDay) ? <FontAwesome name="birthday-cake" /> : null;

  return <h1>{name}{birthdayIcon}</h1>;
}

/**
  * We need to wrap our component with the `register` call to make them acceptable for {LinkedRenderStore::registerRenderer}
  * Note that it doesn't return a react component, but a plain object, so it can't be wrapped in HOC's after this.
  */
export default [
  register(Thing),
  register(ThingNavigation),
  register(ThingName),
  /**
  * The only thing `register` does is mapping the component and static properties onto the underlying
  * function, so if you want your component to serve for multiple configurations, you can just call
  * it manually.
  */
  LinkedRenderStore.registerRenderer(
    link(
      [schema.name, schema.birthDate],
      { returnType: 'value' } // We can adjust whether we get passed (string) values, Nodes, Statements.
    )(PersonName),
    schema.Person,
    schema.name,
    app('topologies/preview')
  ),
];
```

### 3. Wire the views into the store
Register the views so link can resolve them when the data comes in;

```JSX harmony
import LRS from './LRS';

import Thing from './views';

/**
* Notice the spread (...) operator, this is because the (default) export of `./views` returns an
* array rather than a single ComponentRegistration array (returned by
* LinkedRenderStore.registerRenderer), but `registerAll` doesn't handle deeply nested arrays, so
* they should be spread either here, or in the views.
*
* CAUTION: This is the LinkedRenderStore app *instance*, not class from `link-lib`.
*/
LRS.registerAll(
  ...Thing,
);

```

### 4. Enable the store
Now that we have views, lets enable link in the React tree with our `LinkedRenderStore` instance:

```JSX harmony
import { RenderStoreProvider } from 'link-redux';
import { withRouter } from 'react-router';
import LRS from './LRS';

// Either with react-router, or without and just take the current location (but listen for pushstate).
const App = ReactRouter
  ? withRouter(() => <Resource subject={} />)
  : () => <Resource subject={new NamedNode(window.location.href)} />;

export default () => (
  <RenderStoreProvider value={LRS}>
    <Router history={example}>
      <App />
    </Router>
  </RenderStoreProvider>
);
```

### 5. Start the application
It should render (and fetch) resources passed as `subject` to a `Resource` (The
type of `subject` MUST be a NamedNode instance, e.g. `api('todos/5')`).

Note that each `Resource` also acts as a [React error boundary](https://reactjs.org/docs/error-boundaries.html),
so errors should automatically be contained rather than crash your entire app.

## Further usage

### Loading and error handling
Since all data fetching is handled at deeper layers, link also exposes some API's to render different
views when an error occurred or when component is loading. Just register a component under
`ll.ErrorResource` for error handling and `ll.LoadingResource` for loading states
respectively. Different views can be registered for different topologies as well.

The view for when no view could be found can be registered on the type `ll.NoView`

```JSX Harmony
class ThingNavigation extends React.PureComponent {
  // The magical type to catch errors.
  static type = ll.ErrorResource;

  // We can switch views so it renders with appropriate formatting for its location.
  static topology = app('navigation');

  render() {
    // Components rendered when an error occur have some additional props.
    const {
      // The error caught (if any) if this was caused by an error boundary rather than a fetch error.
      caughtError,
      // The request status of the underlying resource, see {LinkedDataApi#getStatus}.
      linkRequestStatus,
      // Call to clear the {subject}'s data and fetch the resource again.
      reloadLinkedObject,
      // A function to reset the error state of the LRC. Useful in conjecture with reloadLinkedObject.
      reset,
      // The IRI of the resource being rendered.
      subject,
     } = this.props;

    return (
      <li onClick={}>Something went wrong, click to try again</li>
    );
  }
}
```

### Datatype rendering
It's also possible to render different views for object literals, like you can resolve views for
resources dynamically, especially handy when the range of the statement can be multiple types and
maintaining a giant switch statement isn't to your liking;

```JSX Harmony
import rdf from '@ontologies/core';

class DollarTableCell extends React.PureComponent {
  // Set the type to Literal to render individual values.
  static type = rdf.Literal;

  /**
  * The `property` field now acts to resolve the data type rather than the predicate.
  * In this case, the dbpedia `usDollar` type.
  */
  static property = dbdt.usDollar;

  // Here too, we can adjust rendering for the appropriate context.
  static topology = app('tableCell');

  render() {
    const literalVal = Number(this.props.linkedProp.value)

    // Use some money library to format the currency
    return (
      <React.Fragment>
        {Money.format(literalVal, 'USD')}
      </React.Fragment>
    );
  }
}
```

### String IRI to NamedNode
It sometimes happens that you recieve an IRI in string form (e.g. window.location.href) which needs
to be converted to a link-enabled NamedNode, you MUST use the [patched version of rdflib](https://github.com/fletcher91/rdfllib.js);
for this, since we work around the default RDFlib.js NamedNode constructor for performance reasons.

### Multi-IRI
Most components wouldn't be very useful if they can only render one type of term. Therefore, most of the methods accept
an array of terms as well:
```jsx harmony
LinkedRenderStore.registerRenderer(Thing, [schema.Thing, owl.Thing]);
```
```jsx harmony
<Property label={[schema.name, rdfs.label]} />
```
