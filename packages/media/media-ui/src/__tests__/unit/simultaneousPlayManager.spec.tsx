import simultaneousPlayManager, {
  SimultaneousPlaySubscription,
} from '../../customMediaPlayer/simultaneousPlayManager';

class DummyVideo {
  pause: () => void;
  subscription: SimultaneousPlaySubscription;

  constructor() {
    this.pause = jest.fn();
    this.subscription = simultaneousPlayManager.subscribe(this.pause);
  }
  play() {
    this.subscription.onPlay();
  }
  unsubscribe() {
    this.subscription.unsubscribe();
  }
}

describe('Simultaneous Play Manager', () => {
  it('should pause all subscribed players, but the current playing one', () => {
    const videoOne = new DummyVideo();
    const videoTwo = new DummyVideo();
    const videoThree = new DummyVideo();

    videoOne.play();

    expect(videoOne.pause).not.toBeCalled();
    expect(videoTwo.pause).toBeCalledTimes(1);
    expect(videoThree.pause).toBeCalledTimes(1);
  });

  it('should not pause unsubscribed players', () => {
    const videoOne = new DummyVideo();
    const videoTwo = new DummyVideo();
    const videoThree = new DummyVideo();

    videoTwo.unsubscribe();
    videoOne.play();

    expect(videoOne.pause).not.toBeCalled();
    expect(videoTwo.pause).not.toBeCalled();
    expect(videoThree.pause).toBeCalledTimes(1);
  });
});
