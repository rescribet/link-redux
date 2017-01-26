# Link Redux
*A Link to the Web*

[![Build Status](https://travis-ci.org/fletcher91/link-redux.svg?branch=master)](https://travis-ci.org/fletcher91/link-redux)

Use this to enable Link in React. It provides components to build data-independent
semantic applications for the human consumption of linked data with React and Redux.

This was built at [Argu](https://argu.co), if you like what we do, these technologies
or open data, send us [a mail](mailto:info@argu.co).

## Basic Usage

Wrap the main React tree with a `LinkedRenderStore`:
```jsx
import configureStore from './configureStore';
import LinkedRenderStore from './configureRenderStore';
import { RenderStoreProvider } from 'link-redux';

export default () => (
  <Provider store={configureStore()}>
    <RenderStoreProvider linkedRenderStore={LinkedRenderStore}>
      <Router history="" />
    </RenderStoreProvider>
  </Provider>
);
```

### Displaying properties
You can now use the provided `Property` component anywhere to render properties of the displayed object:
```jsx
const SomeTypeRenderer = () => (
  <div>
    <Property label="http://schema.org/name" />
    <Property label="http://schema.org/text" />
  </div>
);
```

### Custom Type renderer
Register your view with the render store so it knows that it can use your view to render a certain type with it:
```jsx
const Thing = () => (
  <Card>
    <Property label="http://schema.org/name" />
    <Property label="http://schema.org/description" />
  </Card>
);

LinkedRenderStore.registerRenderer(Thing, 'http://schema.org/Thing');
```
### Custom Property renderer
When using a function to render properties, the attribute is passed as the `linkedProp` property.
```jsx
const Name = ({ linkedProp }) => (
  <Heading size="2">
    {linkedProp}
  </Heading>
);
```

To retrieve the correct property value from the state is no easy task, so when creating complex 
components that need raw access to a property, it is advisable to extend from the `PropertyBase`
component which provides some useful methods to interact with the underlying properties:
```jsx
class ComplexName extends PropertyBase {
  render() {
    return (
      <Heading size="2">
        {processSpecialName(this.getLinkedObjectPropertyRaw())}
      </Heading>
    );
  }
}
```
Since a Property renderer is just a special-case type renderer, we need to register it as well, but with an additional
argument; the property which it is designed to render:
```jsx
LinkedRenderStore.registerRenderer(
  Name,
  'http://schema.org/CreativeWork',
  'http://schema.org/name'
);
```

## Further usage

### IRI expansion
Since writing out the entire [IRI](https://www.ietf.org/rfc/rfc3987.txt) every time is quite some work, the system also
accepts the short-form notation ([compact terms](https://www.w3.org/TR/json-ld/#dfn-term)):
```jsx
  LinkedRenderStore.registerRenderer(Thing, 'schema:Thing');
```
```jsx
  <Property label="schema:name" />
```
See the link-lib documentation for a list of preincluded shorthand definitions.

### Multi-IRI
Most components wouldn't be very useful if they can only render one type of term. Therefore, most of the methods accept
an array of terms as well:
```jsx
LinkedRenderStore.registerRenderer(Thing, ['http://schema.org/Thing', 'owl:Thing']);
```
```jsx
<Property label={['schema:name', 'rdfs:label']} />
```

