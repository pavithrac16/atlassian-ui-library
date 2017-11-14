// @flow
import { cloneElement, type Node } from 'react';
import type GatewayDest from './GatewayDest';

type Child = Node;
type Container = GatewayDest;
type GatewayID = string;
type Name = string;

export default class GatewayRegistry {
  containers: {} = {};
  children: {} = {};
  currentId: number = 0; // Unique key for children of a gateway

  /**
   *   NOTE: this is where we deviate from cloudflare/react-gateway
   *   https://github.com/cloudflare/react-gateway/blob/master/src/GatewayRegistry.js#L10
   *
   *   Rather than passing children through directly, they're cloned with:
   *   - stackIndex
   *   - stackTotal
   */
  renderContainer(name: Name) {
    if (!this.containers[name] || !this.children[name]) {
      return;
    }

    const childrenKeys = Object.keys(this.children[name]);
    const stackTotal = childrenKeys.length;

    this.containers[name].setState({
      children: childrenKeys.sort().map((key, i) => {
        const stackIndex = stackTotal - (i + 1);
        const element = this.children[name][key];

        return cloneElement(element, { key, stackIndex, stackTotal });
      }),
    });
  }

  addContainer(name: Name, container: Container) {
    this.containers[name] = container;
    this.renderContainer(name);
  }

  removeContainer(name: Name) {
    this.containers[name] = null;
  }

  addChild(name: Name, gatewayId: GatewayID, child: Child) {
    this.children[name][gatewayId] = child;
    this.renderContainer(name);
  }

  clearChild(name: Name, gatewayId: GatewayID) {
    delete this.children[name][gatewayId];
  }

  register(name: Name, child: Child) {
    this.children[name] = this.children[name] || {};

    const gatewayId = `${name}_${this.currentId}`;
    this.children[name][gatewayId] = child;
    this.currentId += 1;

    return gatewayId;
  }

  unregister(name: Name, gatewayId: GatewayID) {
    this.clearChild(name, gatewayId);
    this.renderContainer(name);
  }
}
