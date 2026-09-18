import { Composition } from 'remotion';
import { NewsComposition } from './News/NewsComposition';

// Each @remotion/player will render the component that is registered first.
// If you want to render a different component, you can either:
// - Move its registration to the top
// - Use the `?id=` query parameter in the URL
// - Pass a `compositionId` prop to the <Player /> component

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="News"
        component={NewsComposition}
        durationInFrames={1800} // 60 seconds * 30 fps
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
