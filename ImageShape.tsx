/**
 *
 * FILE : ImageShape.tsx
 *
 * DESCRIPTION : Reference : https://codesandbox.io/s/kw51nzpnx3
 *               react-konva video shape
 *
 * AUTHOR : 이은지 (ellen)
 *
 * DATE : 2022-11-28
 *
 */
import { useEffect, useState } from 'react';
import { Image } from 'react-konva';

import { ShapeProps } from './Shape';
import { ImageShapeType } from '@src/atoms/shapes';

type ImageShapeProps = ShapeProps & {
    data: ImageShapeType;
};
export default function ImageShape({ data, shapeRef, onSelect, onDragEnd, onTransformEnd }: ImageShapeProps) {
    const [image, setImage] = useState<HTMLImageElement>();

    useEffect(() => {
        const newImage = new window.Image();
        newImage.src = data.value;
        newImage.onload = () => setImage(newImage);

        return () => setImage(undefined);
    }, [data.value]);

    return (
        <Image
            draggable
            ref={shapeRef}
            image={image}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
            {...data}
        />
    );
}
