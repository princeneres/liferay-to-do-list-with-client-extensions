import React from 'react';
import {createRoot} from 'react-dom';

export default function define(elementName, Component) {
	if (customElements.get(elementName)) {
		return;
	}

	customElements.define(
		elementName,
		class extends HTMLElement {
			connectedCallback() {
				this.root = createRoot(this);

				this.root.render(<Component />);
			}

			disconnectedCallback() {
				this.root.unmount();
			}
		}
	);
}
