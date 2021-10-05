import { Route, Switch, BrowserRouter } from 'react-router-dom';

import { Home } from './Home';
import {TextAreaWidget} from './textarea/TextAreaWidget'
import { ContentEditable } from './editablediv/ContentEditable';

export const Routes = () => {
  return (
    // eslint-disable-next-line no-undef
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/editable-div-widget" component={ContentEditable} />
        <Route exact path="/textarea-widget" component={TextAreaWidget} />
      </Switch>
    </BrowserRouter>
  );
};
