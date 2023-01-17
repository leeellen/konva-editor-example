/**
 *
 * FILE : TextShape.tsx
 *
 * DESCRIPTION : Reference : https://codesandbox.io/s/react-konva-editable-resizable-text-55kyv?file=/src/ResizableText.jsx
 *               react-konva text shape
 *
 * AUTHOR : 이은지 (ellen)
 *
 * DATE : 2022-11-28
 *
 */
import { useRef } from 'react';
import { useRecoilState } from 'recoil';
import { Text } from 'react-konva';
import { Html } from 'react-konva-utils';
import { KonvaEventObject } from 'konva/lib/Node';
import { css } from '@emotion/react';

import palette from '@src/styles/palette';

import { TextShapeType } from '@src/atoms/shapes';
import { selectShapeState } from '@src/atoms/selectShape';
import { textShapeEditState } from '@src/atoms/textShapeEdit';
import { ShapeProps } from './Shape';

type TextShapeProps = ShapeProps & {
    data: TextShapeType;
    onChangeText: (e: React.FormEvent<HTMLDivElement>) => void;
    onTextTransform: (e: KonvaEventObject<Event>) => void;
};

export default function TextShape({
    data,
    shapeRef,
    onSelect,
    onDragEnd,
    onChangeText,
    onTextTransform,
}: TextShapeProps) {
    const textAreaRef = useRef<any>();
    const [selectedShape, setSelectedShape] = useRecoilState(selectShapeState);
    const [textEditMode, setTextEditMode] = useRecoilState(textShapeEditState);
    const { x, y, width, height, fontSize, fontFamily, fill } = data;

    const onKeyDown = (e: any) => {
        e.key === 'Escape' && setTextEditMode(false);
    };

    return (
        <>
            {textEditMode && data.id === selectedShape?.id ? (
                <Html groupProps={{ x, y }} divProps={{ style: { opacity: 1 } }}>
                    <div
                        ref={textAreaRef}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={onChangeText}
                        onKeyDown={onKeyDown}
                        css={css`
                            border: 1px solid ${palette.blue.blue7};
                            outline: none;
                            resize: none;
                            font-size: ${fontSize}px;
                            font-family: ${fontFamily};
                            color: ${fill};
                            text-align: center;
                            margin: 0;
                            min-width: ${width}px;
                            white-space: break-spaces;
                            padding: 15px 0;
                            line-height: 1;
                        `}
                    >
                        {data.text}
                    </div>
                </Html>
            ) : (
                <Text
                    align="center"
                    verticalAlign="middle"
                    draggable
                    ref={shapeRef}
                    onClick={onSelect}
                    onTap={onSelect}
                    onDragEnd={onDragEnd}
                    onTransformEnd={(e) => onTextTransform(e)}
                    onDblClick={(e) => {
                        setSelectedShape(data);
                        setTextEditMode(true);
                    }}
                    onDblTap={() => {
                        setSelectedShape(data);
                        setTextEditMode(true);
                    }}
                    {...data}
                />
            )}
        </>
    );
}
