import React from 'react';
import { useNavigate, Routes, Route } from 'react-router';

import {
    Card,
    Flex,
    Avatar,
    Typography,
    Button,
    Menu,
    Empty
} from 'antd';

import {
    HomeOutlined,
    NotificationOutlined,
    LeftOutlined,
    RightOutlined,
    LogoutOutlined,
    SmileOutlined,
    ToolOutlined,
    RobotOutlined
} from '@ant-design/icons';

import { MobileContext } from '../main';

import Home from '../pages/dashboard/Home';

const { Text, Title } = Typography;

const Menubar = () => {
    const navigate = useNavigate();
    const { mobile, setMobile } = React.useContext(MobileContext); // Using MobileContext

    // State for the Header title and actions
    const [Header, setHeader] = React.useState({
        title: 'Dashboard', // Default title
        actions: [] // Default actions
    });

    const [minimized, setMinimized] = React.useState(true);

    const [staff, setStaff] = React.useState({
        name: {
            first: '',
            middle: '',
            last: ''
        },
        role: '',
        profilePicture: ''
    });

    // Fetch staff data on component mount
    React.useEffect(() => {
        fetch('https://randomuser.me/api/?results=1&inc=name,%20picture')
            .then(response => response.json())
            .then(data => {
                const user = data.results[0];
                setStaff({
                    name: {
                        first: user.name.first,
                        middle: user.name.middle || '',
                        last: user.name.last
                    },
                    role: 'Head',
                    profilePicture: user.picture.large
                });
            })
            .catch(error => {
                console.error('Error fetching staff data:', error);
            });
    }, []);

    const menuItems = [
        {
            key: 'home',
            label: 'Home',
            icon: <HomeOutlined />,
            onClick: () => navigate('/dashboard/home')
        },
        {
            key: 'notifications',
            label: 'Notifications',
            icon: <NotificationOutlined />,
            onClick: () => navigate('/dashboard/notifications')
        },
        {
            key: 'students',
            label: 'Students',
            icon: <SmileOutlined />,
            children: [
                {
                    key: 'profiles',
                    label: 'Profiles',
                    onClick: () => navigate('/dashboard/students/profiles')
                },
                {
                    key: 'disciplinary',
                    label: 'Disciplinary Records',
                    onClick: () => navigate('/dashboard/students/disciplinary')
                },
                {
                    key: 'organization',
                    label: 'Organizations',
                    onClick: () => navigate('/dashboard/students/organization')
                }
            ]
        },
        {
            key: 'utilities',
            label: 'Utilities',
            icon: <ToolOutlined />,
            children: [
                {
                    key: 'calendar',
                    label: 'Event Calendar',
                    onClick: () => navigate('/dashboard/utilities/calendar')
                },
                {
                    key: 'faqs',
                    label: 'FAQs',
                    onClick: () => navigate('/dashboard/utilities/faqs')
                },
                {
                    key: 'announcements',
                    label: 'Announcements',
                    onClick: () => navigate('/dashboard/utilities/announcements')
                },
                {
                    key: 'repository',
                    label: 'Repository',
                    onClick: () => navigate('/dashboard/utilities/repository')
                }
            ]
        },
        {
            key: 'helpbot',
            label: 'Helpbot',
            icon: <RobotOutlined />,
            onClick: () => navigate('/dashboard/helpbot')
        }
    ];

    return (
        <Flex
            className='page-container'
        >
            {/*************************** Sidebar ***************************/}
            <Flex
                vertical
                justify='space-between'
                align='center'
                style={{
                    width: minimized ? '' : 'calc(var(--space-XL) * 24)'
                }}
            >
                <Card
                    size='small'
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        padding: 0,
                        borderRadius: 0
                    }}
                >
                    <Flex
                        vertical
                        justify='space-between'
                        align='center'
                        gap='large'
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Button
                            type='primary'
                            icon={minimized ? <RightOutlined /> : <LeftOutlined />}
                            onClick={() => setMinimized(!minimized)}
                            size={minimized ? 'default' : 'large'}
                            style=
                            {
                                minimized ? {
                                    position: 'unset',
                                    width: '100%'
                                } : {
                                    position: 'absolute',
                                        right: 'calc((var(--space-XL) * -1) / 2)',
                                    zIndex: 1
                                }
                            }
                        />

                        <Flex
                            vertical
                            justify='center'
                            align='center'
                            gap='small'
                            style={{ width: '100%', height: '100%' }}
                        >
                            {
                                minimized ? (
                                    <Avatar
                                        src={staff.profilePicture}
                                        shape='square'
                                        size='large'
                                    />
                                ) : (
                                    <Flex
                                        align='center'
                                        gap='small'
                                        style={{ width: '100%' }}
                                    >
                                        <Avatar
                                            src={staff.profilePicture}
                                            shape='square'
                                            size='large'
                                        />
                                        <Flex vertical>
                                            <Title level={5}>{staff.name.first} {staff.name.middle} {staff.name.last}</Title>
                                            <Text type='secondary'>{staff.role}</Text>
                                        </Flex>
                                    </Flex>
                                )
                            }
                            <Menu
                                defaultSelectedKeys={['home']}
                                inlineCollapsed={minimized}
                                style={{ position: 'relative', height: '100%', padding: 0, border: 'none' }}
                                items={menuItems}
                                mode='inline'
                            />
                        </Flex>

                        <Button
                            type='primary'
                            icon={<LogoutOutlined />}
                            style={{ width: '100%' }}
                            onClick={() => {
                                navigate('/');
                            }}
                        >
                            {minimized ? '' : 'Sign Out'}
                        </Button>
                    </Flex>
                </Card>
            </Flex>

            {/*************************** Main Content Area ***************************/}
            <Flex
                vertical
                justify='start'
                align='stretch'
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'var(--ant-color-bg-layout)'
                }}
            >
                {/*************************** Header ***************************/}
                <Card
                    size='small'
                    style={{
                        width: '100%',
                        borderRadius: 0,
                        backgroundColor: 'var(--ant-color-bg-base)'
                    }}
                >
                    <Flex
                        justify='space-between'
                        align='stretch'
                        gap='large'
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Title level={4} >{Header.title}</Title>
						<Flex justify='flex-end' gap='small'>
							{Header.actions}
						</Flex>
                    </Flex>
                </Card>

                {/*************************** Page Content ***************************/}
                <Card
                    size='small'
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 0,
                        backgroundColor: 'var(--ant-color-bg-layout)'
                    }}
                >
                    <Routes>
                        {['/', '/home'].map((path) => (
                            <Route key={path} path={path} element={<Home setHeader={setHeader} />} />
                        ))}
						<Route path='/notifications' element={<p>Notifications</p>} />
						<Route path='/students/profiles' element={<p>Student Profiles</p>} />
                        <Route path='/students/disciplinary' element={<p>Disciplinary Records</p>} />
                        <Route path='/students/organization' element={<p>Organizations</p>} />
                        <Route path='/utilities/calendar' element={<p>Event Calendar</p>} />
                        <Route path='/utilities/faqs' element={<p>FAQs</p>} />
                        <Route path='/utilities/announcements' element={<p>Announcements</p>} />
                        <Route path='/utilities/repository' element={<p>Repository</p>} />
                        <Route path='/helpbot' element={<p>Helpbot</p>} />
                    </Routes>
                </Card>
            </Flex>
        </Flex>
    );
};

export default Menubar;

export const StaffContext = React.createContext({
    staff: {
        name: {
            first: '',
            middle: '',
            last: ''
        },
        role: '',
        profilePicture: ''
    },
    setStaff: () => { }
});