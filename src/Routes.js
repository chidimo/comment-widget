import { Route, Switch, BrowserRouter } from "react-router-dom";

import { Home } from "./Home";
import { ContentEditable } from "./widget/ContentEditable";

export const Routes = () => {
  return (
    // eslint-disable-next-line no-undef
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/content-editable" component={ContentEditable} />
      </Switch>
    </BrowserRouter>
  );
};
