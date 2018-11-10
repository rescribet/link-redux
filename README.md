# Link Redux
*A Link to the Web*

[![CircleCI](https://circleci.com/gh/fletcher91/link-redux.svg?style=svg)](https://circleci.com/gh/fletcher91/link-redux)
[![Read the Docs](https://img.shields.io/readthedocs/pip.svg)](https://fletcher91.github.io/link-redux/)
![npm version](https://img.shields.io/npm/v/link-lib.svg)
![npm type definitions](https://img.shields.io/npm/types/link-redux.svg)

Use this to enable Link in React. It provides components to build data-independent
semantic applications for the human consumption of linked data with React and Redux.

To transform your Rails application into a linked-data serving beast, see our 
[Active Model Serializers plugin](https://github.com/argu-co/rdf-serializers).

This was built at [Argu](https://argu.co), if you like what we do, these technologies
or open data, send us [a mail](mailto:info@argu.co).

### Installation
`npm install link-lib link-redux rdflib` V `yarn add link-lib link-redux rdflib`

### Demo
See the [TODO app](https://fletcher91.github.io/link-redux-todo/#/) for a live example and
[the source](https://github.com/fletcher91/link-redux-todo) for the implementation. Mind that it
isn't connected to a back-end, so it's only a demo for the view rendering mechanism.

### Road to stable
We're busy working towards a stable version of link lib/redux, since there are a lot of changes, the
documentation might be outdated, if behaviour doesn't seem consistent take a look at the tests or
create an issue.

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

#### Topology providers
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
export const popupTopology = NS.app('topologies/popup');

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

#### Resource renderers
To tell link to fetch and render a resource, just mount a `LinkedResourceContainer` (LRC) anywhere
in your react app. Because the component will try to render every IRI passed, a good place for the
initial mount would be in the router, especially the fallback route. If choosing to use the LRC as a
router, make sure all your resources are resolvable (including the fragment), otherwise a 404 will
occur.

```JSX Harmony
import { namedNodeByIRI, LinkedResourceContainer } from 'link-redux';

class OurTeamPage extends React.PureComponent {
  /* details omitted */
  
  render() {
    /**
    * We use `Grid` here to communicate to the resolved views what their environment is, based on 
    * the registered views for their class (probably <schema:Person>) they'll probably render as a
    * card with their profile picture, name and a small description.
    * 
    * The LRC component expects `subject` to be an instance of rdflib/NamedNode. Obtain one by either:
    * - Using a namespace, e.g. NS.app('person/alice')
    * - Using namedNodeByIRI to get one from a string
    * 
    * NOTE: Using new NamedNode() from rdflib WILL NOT WORK(!) due to implementation details.
    */
    return (
      <div>
        <h1>Our team:</h1>
        <Grid>
            <LinkedResourceContainer subject={NS.app('person/alice')} />
            <LinkedResourceContainer subject={namedNodeByIRI('https://example.com/person/bob')} />
        </Grid>
      </div>
    );
  }
}
```

So all the underlying logic of managing API calls, data fetching, views selecting etc will be 
handled by the `LinkedResourceContainer` component. To show a loading indicator (or an error) for
grid mounted resources while alice and bob are loading, see [Loading and error handling](https://github.com/fletcher91/link-redux#loading-and-error-handling).

#### Property renderers
Property renderers are akin to resource renderers, but they work with one or more properties of a 
resource, rather than an entire resource. This can be useful in a diverse range of use cases;
* When wanting to separate the main resource implementation from property rendering to keep individual components clean.
* When the range (value) of a property isn't known yet - e.g. it could be a number or an entire nested resource.
* When a range of similar properties is appropriate in a location, but only one should be displayed - e.g. <schema:name>, <rdfs:label>, <foaf:name>
* When combining multiple properties into a single view - e.g. geo-coordinates (latd, latm, latns, longd, longew, longm)

When a property has no view registered, and the resolved value is a NamedNode (a link/href), it'll 
automatically mount a LinkedResourceContainer so the nested resource is rendered.

```JSX Harmony
import { Property } from 'link-redux';
const nameTypes = [NS.schema('name'), NS.foaf('name')];

class PersonGrid extends React.PureComponent {
  /* details omitted */
  
  render() {
    // The label defines which properties we like to render.
    return (
      <div>
        <Property label={[NS.schema('name'), NS.foaf('name')]} />
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

#### Middleware
Last but not least, link has its own middleware stack. Each component can call `lrs.exec(iri, payload)`
to execute an action. By default, unhandled actions are passed to the `execActionByIRI` method which
will try to execute a resource if it were a http://schema.org/Action resource as per the [hypermedia
API documentation](https://github.com/fletcher91/link-lib/wiki/Hypermedia-API), which allows you to 
declaratively describe HTTP actions to be done in your application.

Futhermore, if the server responds with the `Exec-Action` header, the server can execute an action 
in the front-end (e.g. trigger some popup to perform a required action). This is what sets it apart
from just using redux for state management, since it allows the front-end to execute actions on far
more data than a client device could calculate, resulting in more powerful experiences without
duplicating logic as well.

The following example implements the state management for a popup, the `processDelta` calls are what
change the state. The syntax is somewhat verbose for middleware this size, but the overhead is 
acceptable for real-world implementations, since you shouldn't need a lot of these methods (most 
actions should be handled automatically with the hypermedia API).

```JSX Harmony
// src/middleware/popup.js
import { memoizedNamespace, namedNodeByIRI } from 'link-lib';
import { Literal, Statement } from 'rdflib';

const PopupMiddleware = (store) => {
  // Define a new namespace for our popup system
  const popup = memoizedNamespace(store.namespaces.app('popup'));
  // Make the namespace available throughout the app
  store.namespaces.popup = popup;
  // Set up the state in the store, e.g. which resource to render and if it should be shown
  store.processDelta([
    new Statement(
      popup('manager'),
      store.namespaces.rdf('type'),
      popup('PopupManager'),
      store.namespaces.ll('replace') // See https://github.com/argu-co/linked-delta for the exact meaning
    ),
    new Statement(
      popup('manager'),
      popup('resource'),
      undefined,
      store.namespaces.ll('replace')
    ),
    new Statement(
      popup('manager'),
      popup('open'),
      Literal.fromBoolean(false),
      store.namespaces.ll('replace')
    ),
  ]);
  
  /**
  * A helper function which defines how the state should be modified.
  */
  const showPopup = (iri) => {
    store.processDelta([
      new Statement(
        popup('manager'),
        popup('resource'),
        namedNodeByIRI(iri),
        store.namespaces.ll('replace')
      ),
      new Statement(
        popup('manager'),
        popup('open'),
        Literal.fromBoolean(true),
        store.namespaces.ll('replace')
      ),
    ]);
    return Promise.resolve();
  };
  
  const hidePopup = () => {
    store.processDelta([
      new Statement(
        popup('manager'),
        popup('open'),
        Literal.fromBoolean(false),
        store.namespaces.ll('replace')
      ),
    ]);
    return Promise.resolve();
  }
  
  //  It's useful to always return a promise (e.g. use `async` if you have ESnext), so the caller
  //  can do stuff after the middleware is done.
  return next => (iri, opts) => {
    // Skip non-popup actions
    if (!iri.value.startsWith(popup().value)) {
      return next(iri, opts);
    }
    
    // Display a popup
    if (iri.value.startsWith(iri.value.startsWith(popup('show').value))) {
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
// Mount `<LinkedResourceContainer subject={NS.popup('manager')} />` somewhere in your app

import { LinkedResourceContainer } from 'link-redux';
import { NS } from '../LRS.jsx';

class PopupManager extends React.PureComponent {
  static type = NS.popup('PopupManager');
  
  static mapDataToProps = [NS.popup('resource'), NS.popup('open')];
  
  render() {
    const { open, resource } = this.props;
    
    if (open.value === 'false') {
      return null;
    }
    
    // The <Popup /> wrapper here is a TopologyProvider. If we were lazy, we could omit this and set
    //  the `topology` prop on LinkedResourceContainer, but consistency is maintainability.
    return (
      <PopupLibrary>
        <Popup>
          <LinkedResourceContainer 
            close={this.props.lrs.exec(NS.popup('close'))} 
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
import { createStore, memoizedNamespace } from 'link-lib';
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
LRS.namespaces.api = memoizedNamespace(FRONTEND_URL);

/**
 * Set up your own namespace for (virtual) app-specific properties (this might be the same as the
 * api). These SHOULD NOT be shared and have app-specific semantics.
 * 
 * Virtual properties are useful for creating behaviour separate from data-source, while still using
 * the same interface.
 */
LRS.namespaces.app = memoizedNamespace(FRONTEND_URL);

export const NS = LRS.namespaces;

/**
* It's useful to have a central source of valid application topologies. This also provides a 
* location to document the intended usage.
*
* A common issue when beginning with link is forgetting to set the correct topology(ies), so 
* defaulting to registering views under all topologies can prevent a lot of headaches. Mind that
* over-registering might cause the wrong view to be rendered rather than none at all.
*/
export const allTopologies = [
  // This defaults to the `DEFAULT_TOPOLOGY` from link-lib
  // Generally used to mean that the resource is the main content on the page.
  undefined,
  // The resource/property is rendered within the navigation menu (e.g. as a `li`)
  NS.app('navigation'),
  // The resource/prop is rendered in a table (e.g. as a single row within the table).
  NS.app('table'),
  // The resource/prop is rendered in a row (e.g. as a single cell within the row).
  NS.app('row'),
  // The resource/prop is rendered in a cell (e.g. as a raw value or some small representation).
  NS.app('cell'),
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
import LinkedRenderStore, { RENDER_CLASS_NAME } from 'link-lib';
import { link, register, Property, LinkedResourceContainer } from 'link-redux';
import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import { NS } from './LRS';

class Thing extends React.PureComponent {
  static type = NS.schema('Thing');
  
  /**
  * This function automatically wraps your component with the `link` method to bind your component 
  * to store data (like `connect` in redux).
  */
  static mapDataToProps = [
    NS.schema('text'), 
    NS.schema('creator'),
  ];
  
  render() {
    const { creator, text } = this.props;
    
    return (
      <div>
        <Property label={NS.schema('name')}/> // Delegate the rendering of the name to another dynamically resolved component
        <p>{text.value}</p>
        <LinkedResourceContainer subject={creator} />
      </div>
    );
  }
}

class ThingNavigation extends React.PureComponent {
  static type = NS.schema('Thing');
  
  static mapDataToProps = [NS.schema('name')];
  
  static topology = NS.app('navigation');
  
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
* As you can see, components don't have to be classes, but can be SFC as well.
*/
const ThingName = ({ linkedProp }) => <h1>{linkedProp.value}</h1>;

ThingName.type = NS.schema('Thing');
ThingName.property = NS.schema('name');
/**
 * We'll bind all known topologies to this component, rather than the larger components since it has
 * less chance to overflow out of bounds.
 * We can use `undefined` here as a shortcut for the default as well (bound to the `Thing` component).
 */
ThingName.topology = allTopologiesExcept(undefined, NS.app('navigation'), );

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
      [NS.schema('name'), NS.schema('birthDate')],
      { returnType: 'value' } // We can adjust whether we get passed (string) values, Nodes, Statements.
    )(PersonName),
    NS.schema('Person'),
    NS.schema('name'),
    NS.app('topologies/preview')
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
import configureReduxStore from './configureStore';
import LRS from './LRS';

// Either with react-router, or without and just take the current location (but listen for pushstate).
const App = ReactRouter
  ? withRouter(() => <LinkedResourceContainer subject={} />)         
  : () => <LinkedResourceContainer subject={namedNodeByIRI(window.location.href)} />;

export default () => (
  <Provider store={configureReduxStore()}>
    <RenderStoreProvider value={LRS}>
      <Router history={example}>
        <App /> 
      </Router>
    </RenderStoreProvider>
  </Provider>
);
```

### 5. Start the application
It should render (and fetch) resources passed as `subject` to a `LinkedResourceContainer` (The
type of `subject` MUST be a NamedNode instance, e.g. `NS.api('todos/5')`). 

Note that each `LinkedResourceContainer` also acts as a [React error boundary](https://reactjs.org/docs/error-boundaries.html),
so errors should automatically be contained rather than crash your entire app.

## Further usage

### Loading and error handling
Since all data fetching is handled at deeper layers, link also exposes some API's to render different
views when an error occurred or when component is loading. Just register a component under 
`NS.ll('ErrorResource')` for error handling and `NS.ll('LoadingResource')` for loading states 
respectively. Different views can be registered for different topologies as well.

```JSX Harmony
class ThingNavigation extends React.PureComponent {
  // The magical type to catch errors.
  static type = NS.ll('ErrorResource');
  
  // We can switch views so it renders with appropriate formatting for its location.
  static topology = NS.app('navigation');
  
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
class DollarTableCell extends React.PureComponent {
  // Set the type to Literal to render individual values.
  static type = NS.rdfs("Literal");
  
  /** 
  * The `property` field now acts to resolve the data type rather than the predicate.
  * In this case, the dbpedia `usDollar` type.
  */
  static property = NS.dbdt("usDollar");
 
  // Here too, we can adjust rendering for the appropriate context.
  static topology = NS.app('tableCell');
  
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
to be converted to a link-enabled NamedNode, you MUST use the [provided function `namedNodeByIRI`](https://fletcher91.github.io/link-lib/globals.html#namednodebyiri);
for this, since we work around the default RDFlib.js NamedNode constuctor for performance reasons.

### Multi-IRI
Most components wouldn't be very useful if they can only render one type of term. Therefore, most of the methods accept
an array of terms as well:
```jsx harmony
LinkedRenderStore.registerRenderer(Thing, [NS.schema('Thing'), NS.owl('Thing')]);
```
```jsx harmony
<Property label={[NS.schema('name'), NS.rdfs('label')]} />
```

