
import { TableShape } from '@/types/restaurant';
import { Circle, Square, RectangleHorizontal } from 'lucide-react';

interface TableIconProps {
  forme: TableShape;
  className?: string;
}

const TableIcon = ({ forme, className = "h-5 w-5" }: TableIconProps) => {
  switch (forme) {
    case 'ronde':
      return <Circle className={className} />;
    case 'carre':
      return <Square className={className} />;
    case 'rectangulaire':
      return <RectangleHorizontal className={className} />;
    default:
      return <Circle className={className} />;
  }
};

export default TableIcon;
