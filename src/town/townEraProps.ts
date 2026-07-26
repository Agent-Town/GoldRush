import e10Props from '../../assets/pilots/plaza-props-3d/era-props.e10.json' with { type: 'json' };
import e2Props from '../../assets/pilots/plaza-props-3d/era-props.e2.json' with { type: 'json' };
import e3Props from '../../assets/pilots/plaza-props-3d/era-props.e3.json' with { type: 'json' };
import e4Props from '../../assets/pilots/plaza-props-3d/era-props.e4.json' with { type: 'json' };
import e5Props from '../../assets/pilots/plaza-props-3d/era-props.e5.json' with { type: 'json' };
import e8Props from '../../assets/pilots/plaza-props-3d/era-props.e8.json' with { type: 'json' };
import e9Props from '../../assets/pilots/plaza-props-3d/era-props.e9.json' with { type: 'json' };
import type { TownEraPropDescriptor } from './townLayout';

type TownEraPropManifest = {
  epoch: number;
  floodReset?: boolean;
  props: TownEraPropDescriptor[];
};

const fallbackTownEraPropManifests: Record<string, TownEraPropManifest> = {
  '../../assets/pilots/plaza-props-3d/era-props.e2.json': e2Props as TownEraPropManifest,
  '../../assets/pilots/plaza-props-3d/era-props.e3.json': e3Props as TownEraPropManifest,
  '../../assets/pilots/plaza-props-3d/era-props.e4.json': e4Props as TownEraPropManifest,
  '../../assets/pilots/plaza-props-3d/era-props.e5.json': e5Props as TownEraPropManifest,
  '../../assets/pilots/plaza-props-3d/era-props.e8.json': e8Props as TownEraPropManifest,
  '../../assets/pilots/plaza-props-3d/era-props.e9.json': e9Props as TownEraPropManifest,
  '../../assets/pilots/plaza-props-3d/era-props.e10.json': e10Props as TownEraPropManifest,
};

const townEraPropManifests =
  typeof import.meta.env === 'object'
    ? (import.meta.glob('../../assets/pilots/plaza-props-3d/era-props.e*.json', {
        eager: true,
        import: 'default',
      }) as Record<string, TownEraPropManifest>)
    : fallbackTownEraPropManifests;

export function townEraPropsForOrder(activeEra: number): readonly TownEraPropDescriptor[] {
  const manifests = Array.from({ length: Math.max(0, activeEra - 1) }, (_, index) => index + 2)
    .map((era) => townEraPropManifests[`../../assets/pilots/plaza-props-3d/era-props.e${era}.json`])
    .filter((manifest): manifest is TownEraPropManifest => !!manifest);
  return manifests.slice(Math.max(0, manifests.map((manifest) => manifest.floodReset).lastIndexOf(true)))
    .flatMap((manifest) => manifest.props);
}
