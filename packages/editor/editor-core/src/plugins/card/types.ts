export type CardAppearance = 'inline' | 'block';
export type CardType = 'smart-card' | 'custom' | 'unsupported';

export interface CardProvider {
  resolve(url: string, appearance: CardAppearance): Promise<any>;
}

export interface CardOptions {
  provider?: Promise<CardProvider>;
}

export type Request = {
  pos: number;
  url: string;
  appearance: CardAppearance;
};

export type CardPluginState = {
  requests: Request[];
  provider: CardProvider | null;
};

// actions
export type SetProvider = {
  type: 'SET_PROVIDER';
  provider: CardProvider | null;
};

export type Queue = {
  type: 'QUEUE';
  url: string;
  pos: number;
  appearance: CardAppearance;
};

export type Resolve = {
  type: 'RESOLVE';
  url: string;
};

export type CardPluginAction = SetProvider | Queue | Resolve;
