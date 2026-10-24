"use client";

import { Component } from "react";

/**
 * Isolates the Leaflet map from the rest of the app.
 *
 * React Leaflet can throw while mounting/unmounting its imperative instance
 * (e.g. "Map container is being reused by another instance" or a detached
 * layer's `_targets` being null) — especially with React's <Activity>, which
 * Next.js uses to hide routes on navigation. That crash must never bubble to
 * the route-level error boundary and blank the whole page, so we contain it
 * here and offer a manual retry.
 */
export default class MapBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[map] recovered from render error:", error?.message ?? error);
    }
  }

  retry = () => this.setState({ failed: false });

  render() {
    if (this.state.failed) {
      return (
        <div className="grid h-full min-h-[420px] w-full place-items-center rounded-2xl border border-line bg-paper/50 px-6 text-center">
          <div>
            <p className="text-sm text-muted">{this.props.fallbackText ?? "Map temporarily unavailable."}</p>
            <button
              type="button"
              onClick={this.retry}
              className="mt-4 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-forest-deep"
            >
              {this.props.retryText ?? "Reload map"}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
