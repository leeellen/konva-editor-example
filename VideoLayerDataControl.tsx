/**
 *
 * FILE : VideoLayerDataControl
 *
 * DESCRIPTION : 비디오 레이어 데이터 조작 컴포넌트
 *
 * AUTHOR : 이은지 (ellen)
 *
 * DATE : 2023-01-13
 *
 */
import { useRecoilState } from 'recoil';
import { css } from '@emotion/react';
import { Button, Input, RadioChangeEvent, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';

import Icons from '@components/icons';
import { VideoShapeType } from '@src/atoms/shapes';
import { selectShapeState } from '@src/atoms/selectShape';
import { DataControlType } from '.';

export default function VideoLayerDataControl({ updateShapeData, beforeUpload }: DataControlType) {
    const [selectedShape] = useRecoilState(selectShapeState);

    const onChange = (e: React.ChangeEvent<HTMLInputElement> | RadioChangeEvent) => {
        const { name, value } = e.target;
        if (!name) return;

        updateShapeData(name, value);
    };

    if (!selectedShape || !beforeUpload) return <></>;

    const { title } = selectedShape as VideoShapeType;

    return (
        <>
            <section>
                <label>1. 동영상 레이어 제목을 입력해 주세요.</label>
                <Input
                    name="title"
                    placeholder="제목을 입력해주세요."
                    css={css`
                        width: 360px;
                    `}
                    value={title}
                    onChange={onChange}
                />
            </section>

            <section>
                <label>2. mp4 파일을 업로드 해주세요.</label>
                <p className="gray6 fs-13 fw-500 mb-8">가로16 : 세로9 비율이 적절해요. 50MB이하만 업로드가 가능해요.</p>

                <Upload
                    beforeUpload={(file: RcFile) => beforeUpload(file, (value) => updateShapeData('value', value))}
                    accept="video/mp4"
                    showUploadList={false}
                >
                    <Button
                        icon={<Icons icon="upload" />}
                        css={css`
                            width: 232px;
                        `}
                    >
                        동영상 업로드하기
                    </Button>
                </Upload>
            </section>
        </>
    );
}
