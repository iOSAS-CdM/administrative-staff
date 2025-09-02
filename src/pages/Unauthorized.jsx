import React from 'react';
import { useNavigate } from 'react-router';

import { Flex, Button, Image, Typography, Card } from 'antd';

const { Text, Title } = Typography;

import '../styles/pages/Authentication.css';

import { DisplayThemeContext } from '../main';

const Unauthorized = () => {
	const { displayTheme, setDisplayTheme } = React.useContext(DisplayThemeContext);
	const navigate = useNavigate();

	return (
		<>
			<div id='auth-background' className={displayTheme}>
				<svg width='560' height='960' viewBox='0 0 560 960' fill='transparent'>
					<path d='M200 120L160 80L240 80L200 120Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 120L320 80L400 80L360 120Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 120L0 80L80 80L40 120Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 600L160 560H240L200 600Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 600L320 560H400L360 600Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 600L0 560H80L40 600Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 360L160 320H240L200 360Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 360L320 320H400L360 360Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 360L0 320H80L40 360Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 840L160 800H240L200 840Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 840L320 800H400L360 840Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 840L0 800H80L40 840Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 240L240 200H320L280 240Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 240L400 200H480L440 240Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 240L80 200H160L120 240Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 720L240 680H320L280 720Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 720L400 680H480L440 720Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 720L80 680H160L120 720Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 480L240 440H320L280 480Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 480L400 440H480L440 480Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 480L80 440H160L120 480Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 960L240 920H320L280 960Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 960L400 920H480L440 960Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 960L80 920H160L120 960Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 40L160 0L240 4.03789e-06L200 40Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 40L320 0L400 4.03789e-06L360 40Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 40L0 0L80 4.03789e-06L40 40Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 520L160 480H240L200 520Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 520L320 480H400L360 520Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 520L0 480H80L40 520Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 280L160 240H240L200 280Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 280L320 240H400L360 280Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 280L0 240H80L40 280Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 760L160 720H240L200 760Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 760L320 720H400L360 760Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 760L0 720H80L40 760Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 160L240 120L320 120L280 160Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 160L400 120L480 120L440 160Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 160L80 120L160 120L120 160Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 640L240 600H320L280 640Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 640L400 600H480L440 640Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 640L80 600H160L120 640Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 400L240 360H320L280 400Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 400L400 360H480L440 400Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 400L80 360H160L120 400Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 880L240 840H320L280 880Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 880L400 840H480L440 880Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 880L80 840H160L120 880Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 80L240 40L320 40L280 80Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M440 80L400 40L480 40L440 80Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 80L80 40L160 40L120 80Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 560L240 520H320L280 560Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M440 560L400 520H480L440 560Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 560L80 520H160L120 560Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 320L240 280H320L280 320Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M440 320L400 280H480L440 320Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 320L80 280H160L120 320Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 800L240 760H320L280 800Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M440 800L400 760H480L440 800Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 800L80 760H160L120 800Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 200L320 160H400L360 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M520 200L480 160H560L520 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 200L160 160H240L200 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 680L320 640H400L360 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M520 680L480 640H560L520 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 680L160 640H240L200 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 440L320 400H400L360 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M520 440L480 400H560L520 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 440L160 400H240L200 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 920L320 880H400L360 920Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M520 920L480 880H560L520 920Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 920L160 880H240L200 920Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 80L80 40L160 40L120 80Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 80L240 40L320 40L280 80Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 560L80 520H160L120 560Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 560L240 520H320L280 560Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 320L80 280H160L120 320Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 320L240 280H320L280 320Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 800L80 760H160L120 800Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 800L240 760H320L280 800Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 200L160 160H240L200 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 200L320 160H400L360 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M40 200L0 160H80L40 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 680L160 640H240L200 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 680L320 640H400L360 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M40 680L0 640H80L40 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 440L160 400H240L200 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 440L320 400H400L360 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M40 440L0 400H80L40 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 920L160 880H240L200 920Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 920L320 880H400L360 920Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M40 920L0 880H80L40 920Z' fill='var(--ant-color-primary-text-active)' />
				</svg>
			</div>

			<Card
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)'
				}}
			>
				<Flex vertical align='center' gap={32}>
					<Image width={256} height={256} src='/CDM Logo.png' preview={false} />
					<Flex vertical align='center' gap={4}>
						<Title level={3} style={{ textAlign: 'center' }}>Unauthorized Access</Title>
						<Text style={{ textAlign: 'center' }}>You do not have permission to use this application</Text>
						<Text style={{ textAlign: 'center' }}>Please contact the <a href='mailto:danieljohnbyns@gmail.com'>system developer</a> if you believe this is an error</Text>
					</Flex>
					<Button type='primary' size='large' onClick={() => { window.localStorage.clear(); navigate('/authentication/sign-in'); }}>Go to Home</Button>
				</Flex>
			</Card>
		</>
	);
};

export default Unauthorized;