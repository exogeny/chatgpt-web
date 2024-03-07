import React from "react";

interface IErrorBoundaryState {
  hasError: boolean;
  error: any;
  info: any;
}

export class ErrorBoundary extends React.Component<any, IErrorBoundaryState> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <p>
            {this.state.error.toString()}
          </p>
          <p>
            {this.state.info.componentStack}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}