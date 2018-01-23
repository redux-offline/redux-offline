import React from 'react';
import { Provider } from 'react-redux';
import Basic from '../pages/Basic';
import Promise from '../pages/Promise';
import Observer from '../pages/Observer';
import store from '../store';

class App extends React.Component {
  state = {
    page: 'home'
  };

  pages = {
    home: { page: 'home' },
    basic: { page: 'basic' },
    promise: { page: 'promise' },
    observer: { page: 'observer' }
  };

  render() {
    const { page } = this.state;
    if (page === 'home') {
      return (
        <div>
          <button onClick={() => this.setState(this.pages.basic)}>
            basic
          </button>
          <button onClick={() => this.setState(this.pages.promise)}>
            promise
          </button>
          <button onClick={() => this.setState(this.pages.observer)}>
            observer
          </button>
        </div>
      );
    }

    return (
      <Provider store={store}>
        <div className="container">
          {page === 'basic' &&
            <Basic goBack={() => this.setState(this.pages.home)} />
          }
          {page === 'promise' &&
            <Promise goBack={() => this.setState(this.pages.home)} />
          }
          {page === 'observer' &&
            <Observer />
          }
        </div>
      </Provider>
    );
  }
}

export default App;
