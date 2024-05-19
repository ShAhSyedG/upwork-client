import {
  CarFilled,
  BellFilled,
  BulbFilled,
  CrownFilled,
  CameraFilled,
  ExperimentFilled,
  FireFilled,
  RocketFilled,
  SketchCircleFilled,
  StarFilled,
} from '@ant-design/icons';

export const symbolOptions = [
  { value: 'camera', label: <CameraFilled /> },
  { value: 'car', label: <CarFilled /> },
  { value: 'bulb', label: <BulbFilled /> },
  { value: 'bell', label: <BellFilled /> },
  { value: 'crown', label: <CrownFilled /> },
  { value: 'experiment', label: <ExperimentFilled /> },
  { value: 'fire', label: <FireFilled /> },
  { value: 'rocket', label: <RocketFilled /> },
  { value: 'diamond', label: <SketchCircleFilled /> },
  { value: 'star', label: <StarFilled /> },
];

export const getCandidateSymbol = (key) => {
  const data = {
    car: <CarFilled style={{ fontSize: 20 }} />,
    bell: <BellFilled style={{ fontSize: 20 }} />,
    bulb: <BulbFilled style={{ fontSize: 20 }} />,
    crown: <CrownFilled style={{ fontSize: 20 }} />,
    camera: <CameraFilled style={{ fontSize: 20 }} />,
    experiment: <ExperimentFilled style={{ fontSize: 20 }} />,
    fire: <FireFilled style={{ fontSize: 20 }} />,
    rocket: <RocketFilled style={{ fontSize: 20 }} />,
    diamond: <SketchCircleFilled style={{ fontSize: 20 }} />,
    star: <StarFilled style={{ fontSize: 20 }} />,
  };
  return data[key];
};
