import type { TownEraPropDescriptor } from './townLayout';

type TownEraPropManifest = {
  epoch: number;
  floodReset?: boolean;
  props: TownEraPropDescriptor[];
};

const townEraPropManifests = import.meta.glob('../../assets/pilots/plaza-props-3d/era-props.e*.json', {
  eager: true,
  import: 'default',
}) as Record<string, TownEraPropManifest>;

export function townEraPropsForOrder(activeEra: number): readonly TownEraPropDescriptor[] {
  const manifests = Array.from({ length: Math.max(0, activeEra - 1) }, (_, index) => index + 2)
    .map((era) => townEraPropManifests[`../../assets/pilots/plaza-props-3d/era-props.e${era}.json`])
    .filter((manifest): manifest is TownEraPropManifest => !!manifest);
  return manifests.slice(Math.max(0, manifests.map((manifest) => manifest.floodReset).lastIndexOf(true)))
    .flatMap((manifest) => manifest.props);
}
