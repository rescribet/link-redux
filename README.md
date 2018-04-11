# Link Redux
*A Link to the Web*

[![Build Status](https://travis-ci.org/fletcher91/link-redux.svg?branch=master)](https://travis-ci.org/fletcher91/link-redux)
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

## Basic Usage

### 1. Set up the store
Create a helper to set up an instance of [the `LinkedRenderStore`](https://fletcher91.github.io/link-lib/classes/linkedrenderstore.html)
to use in your application;
```javascript
// LRS.js
import LinkedRenderStore, { memoizedNamespace } from 'link-lib';
import { FRONTEND_URL } from './config';

const LRS = new LinkedRenderStore();

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

export default LRS;
```

### 2. Add some views
Write some views to render resources:
```JSX harmony
import LinkedRenderStore, { RENDER_CLASS_NAME } from 'link-lib';
import { link, Property, LinkedResourceContainer } from 'link-redux';
import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import { NS } from './LRS';

const Thing = ({ creator, text }) => (
  <div>
    <Property label={NS.schema('name')}/>
    <p>{text.value}</p>
    <LinkedResourceContainer subject={creator} />
  </div>
);

// The `subject` property is always given to rendered views so it can link to itself.
const ThingNavigation = ({ name, subject }) => (
  <li>
    <Link to={subject.value}>
      {name.value}
    </Link>
  </li>
);

// Properties without being connected via the `link` function recieve their prop's value via `linkedProp`
const ThingName = ({ linkedProp }) => <h1>{linkedProp.value}</h1>;

// We want to show whether it's the users' birthday
const PersonName = ({ birthDay, name }) => {
  const birthdayIcon = isToday(birthDay) ? <FontAwesome name="birthday-cake" /> : null;
  
  return <h1>{name}{birthdayIcon}</h1>;
}
export default [
  LinkedRenderStore.registerRenderer(
    link([NS.schema('name'), NS.schema('text'), NS.schema('creator')])(Thing),
    NS.schema('Thing')
  ),
  LinkedRenderStore.registerRenderer(
    link([NS.schema('name')])(ThingNavigation),
    NS.schema('Thing'),
    RENDER_CLASS_NAME, // We want to register a type renderer (name subject to change)
    NS.app('navigation')
  ),
  LinkedRenderStore.registerRenderer(
    ThingName,
    NS.schema('Thing'),
    NS.schema('name')
  ),
  LinkedRenderStore.registerRenderer(
    link(
      [NS.schema('name'), NS.schema('birthDate')],
      { returnType: 'value' } // We can adjust whether we get passed (string) values, Nodes, Statements.
    )(PersonName),
    NS.schema('Person'),
    NS.schema('name')
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
import LinkedRenderStore from './LRS';

// Either with react-router, or without and just take the current location (but listen for pushstate).
const App = ReactRouter
  ? withRouter(() => <LinkedResourceContainer subject={} />)         
  : () => <LinkedResourceContainer subject={namedNodeByIRI(window.location.href)} />;

export default () => (
  <Provider store={configureReduxStore()}>
    <RenderStoreProvider linkedRenderStore={LinkedRenderStore}>
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

## Further usage

### String IRI to NamedNode
It sometimes happens that you recieve an IRI in string form (e.g. window.location.href) which needs
to be converted to a link-enabled NamedNode, see the [`namedNodeByIRI` function](https://fletcher91.github.io/link-lib/globals.html#namednodebyiri);

### Multi-IRI
Most components wouldn't be very useful if they can only render one type of term. Therefore, most of the methods accept
an array of terms as well:
```jsx harmony
LinkedRenderStore.registerRenderer(Thing, [NS.schema('Thing'), NS.owl('Thing')]);
```
```jsx harmony
<Property label={[NS.schema('name'), NS.rdfs('label')]} />
```

