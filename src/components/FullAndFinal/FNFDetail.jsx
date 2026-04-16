import { Avatar, Button, Card, Col, DatePicker, Flex, Form, Input, message, Row, Select, Tabs } from "antd"
import Title from "antd/es/typography/Title"
import Text from "antd/es/typography/Text"
import { ArrowLeft, Banknote, BriefcaseBusiness, Building, Calendar, IdCard, TextInitial, User } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import NewFNF from "./NewFNF"
import axiosInstance from "../../services/axiosInstance"
import Additions from "./Additions"
import Deductions from "./Deductions"
import { useDispatch } from "react-redux"
import { set } from "../../redux/uiSlice"

const decimalRule = (decimals = null, { allowNegative = false } = {}) => ({
    validator: (_, value) => {
        if (value === undefined || value === null || value === '') return Promise.resolve()
        const str = String(value)

        if (decimals === 0) {
            const re = allowNegative ? /^-?\d+$/ : /^\d+$/;
            return re.test(str)
                ? Promise.resolve()
                : Promise.reject(new Error(allowNegative ? 'Integers only (±)' : 'Integers only'))
        }

        const sign = allowNegative ? '-?' : ''
        if (decimals === null) {
            const re = new RegExp(`^(?:${sign}\\d+|${sign}\\d+\\.\\d*|${sign}\\.\\d+)$`)
            return re.test(str) ? Promise.resolve() : Promise.reject(new Error('Enter a valid number'))
        }
        const re = new RegExp(
            `^(?:${sign}\\d+(?:\\.\\d{0,${decimals}})?|${sign}\\.\\d{1,${decimals}})$`,
        )
        return re.test(str)
            ? Promise.resolve()
            : Promise.reject(
                new Error(`Up to ${decimals} decimal places${allowNegative ? ' (±)' : ''}`),
            )
    },
})

const formatCurrency = (value, locale = "en-IN", currency = "INR") =>
    new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).format(value);

const useIsMobile = (query = '(max-width: 768px)') => {
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const mq = window.matchMedia(query)
        const onChange = (e) => setIsMobile(e.matches)
        setIsMobile(mq.matches)
        try {
            mq.addEventListener('change', onChange)
            return () => mq.removeEventListener('change', onChange)
        } catch {
            mq.addListener(onChange)
            return () => mq.removeListener(onChange)
        }
    }, [query])
    return isMobile
}
export const FNFDetail = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [attendanceSnapshotData, setAttendanceSnapshotData] = useState(null);
    const [activeKey, setActiveKey] = useState('1');
    const params = useParams();
    const dispatch = useDispatch();
    function handleBack() {
        navigate("/fnf");
    }


    const items = useMemo(
        () => [
            {
                key: '1',
                label: 'Additions',
                children: (
                    <Additions
                        employee={selectedEmployee}
                        employeeDetails={selectedEmployee}
                        fetchFNFEmployees={selectedEmployee}
                        setSelectedEmployee={selectedEmployee}
                        isLoading={false}
                        goToDeductions={() => setActiveKey('2')}
                        setAdditionsData={() => null}
                        fnfDetailsByEcode={selectedEmployee}
                    />
                ),
            },
            {
                key: '2',
                label: 'Deductions',
                children: (
                    <Deductions
                        employee={selectedEmployee}
                        fetchFNFEmployees={selectedEmployee}
                        setSelectedEmployee={() => null}
                        additionsData={selectedEmployee}
                    />
                ),
            },
        ],
        [selectedEmployee],
    )

    async function fetchFnfDetail() {
        try {
            await dispatch(set({loading: true}));
            const response = await axiosInstance.get(`/api/Fnf/FNFProcessedList?search=${params.id}`);
            if (!response?.data || !response?.data?.data || !response?.data?.data?.items || !Array.isArray(response?.data?.data?.items) || !response?.data?.data?.items?.length) {
                message.error("No data found.");
                return;
            }
            console.log(response.data.data.items[0]);
            setSelectedEmployee(response.data.data.items[0]);
            await dispatch(set({loading: false}));
        } catch (error) {
            message.error(error?.message || "Something went wrong. Please try again.");
            await dispatch(set({loading: false}));
        }
    }

    function getMonthYear(date) {
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear().toString().slice(-2);
        return `${month}-${year}`;
    }

    async function fetchAttendanceSnapshot() {
        try {
            await dispatch(set({loading: true}));
            const _ecode = selectedEmployee?.ecode;
            const _month = getMonthYear(new Date(selectedEmployee?.dateOfLeaving));
            if (!_ecode || !_month) {
                message.error("Ecode or Resignation Date not available.")
                return;
            }
            const res = await axiosInstance.get(
                `/api/EmpAttendanceViewSnapshot/EmployeeSalarySnapShotByEcode?ecode=${_ecode}&month=${_month}`,
            );
            console.log("res", res);
            setAttendanceSnapshotData(res?.data?.data[0]);
            await dispatch(set({loading: false}));
        } catch (error) {
            await dispatch(set({loading: false}));
            console.error(error);
        }
    }

    async function handleSubmit(data) {
        const payload = { ...data, fNFId: selectedEmployee?.fnfId };
        console.log(payload);
        try {
            const response = await axiosInstance.post("/api/FNF/save-fnf-payment", payload);
            console.log(response)
        } catch (error) {
            message.error(error?.message || "Something went wrong. Please try again.");
        }
    }

    useEffect(() => {
        fetchFnfDetail();
    }, []);

    useEffect(() => {
        if (selectedEmployee === null) return;
        console.log("snapshot")
        fetchAttendanceSnapshot();
    }, [selectedEmployee]);

    const Header = () => (
        <div style={{ paddingTop: 8, paddingBottom: 8 }}>
            <Flex gap={8} align='center'>
                {
                    <Button style={{ paddingLeft: ".25rem" }} color="default" variant='solid' shape='round' onClick={handleBack} icon={<Flex align='center' justify='center' style={{ backgroundColor: "white", width: "1.5rem", height: "1.5rem", borderRadius: "50%" }}><ArrowLeft color='black' size={14} /></Flex>}>Back</Button>
                }
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>FULL &amp; FINAL</Title>
            </Flex>
        </div>
    )
    return (
        <>
            <Header />
            <div
                style={{
                    marginBottom: 12,
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                    background: '#fafafa',
                }}
            >
                <Flex style={{ fontWeight: 600, marginBottom: 8 }} gap={4} wrap align='center'>
                    <Avatar icon={<User />} size={48} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                    <Title level={3} style={{ margin: "0" }}>Employee Details</Title>
                </Flex>
                <Row gutter={[8, 8]}>
                    <Col xs={24} sm={16} lg={8}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Avatar shape='square' icon={<TextInitial size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Name</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.employeeName || "__"}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={8}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Avatar shape='square' icon={<IdCard size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Code</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.ecode || "__"}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={8}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Avatar shape='square' icon={<Building size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Department</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.department || "__"}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={8}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Avatar shape='square' icon={<BriefcaseBusiness size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Designation</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.designation || "__"}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={8}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Avatar shape='square' icon={<Calendar size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Joining Date</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.dateOfJoining ? selectedEmployee?.dateOfJoining.slice(0, 10) : "__"}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={8}>
                        <Card variant="borderless" size='small' style={{ width: "100%" }}>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Avatar shape='square' icon={<Calendar size={16} />} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Resignation Date</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.dateOfLeaving ? selectedEmployee?.dateOfLeaving.slice(0, 10) : "__"}</Title>
                            </Flex>
                        </Card>
                    </Col>
                </Row>
                {/* <Row gutter={8}>
          </Row> */}
            </div>
            <div
                style={{
                    marginBottom: 12,
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                    background: '#fafafa',
                }}
            >
                <Flex style={{ fontWeight: 600, marginBottom: 8 }} gap={4} wrap align='center'>
                    <Avatar icon={<Banknote />} size={48} style={{ backgroundImage: "linear-gradient(to right bottom, #1e2939 0%, #90a1b9 100%)", border: "none" }} />
                    <Title level={3} style={{ margin: "0" }}>Payment Details</Title>
                </Flex>
                <Row gutter={[8, 8]}>
                    <Col xs={24} sm={16} lg={6}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Rate</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.rate ? formatCurrency(selectedEmployee?.rate) : formatCurrency(0)}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={6}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Bonus</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.bonus ? formatCurrency(selectedEmployee?.bonus) : formatCurrency(0)}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={6}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Gratuity</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.gratuity ? formatCurrency(selectedEmployee?.gratuity) : formatCurrency(0)}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={6}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>TDS</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.tds ? formatCurrency(selectedEmployee?.tds) : formatCurrency(0)}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={6}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Unpaid Salary Amount</Text>
                                <Title level={5} style={{ margin: "0" }}>{attendanceSnapshotData && attendanceSnapshotData['Monthly_Gross_CTC_Actual_After_Deduction_AND_AddONS_'] ? formatCurrency(attendanceSnapshotData['Monthly_Gross_CTC_Actual_After_Deduction_AND_AddONS_']) : formatCurrency(0)}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={6}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>Payable Days</Text>
                                <Title level={5} style={{ margin: "0" }}>{attendanceSnapshotData && attendanceSnapshotData['Payble_Days'] ? attendanceSnapshotData['Payble_Days'] : 0}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={6}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>EL Days</Text>
                                <Title level={5} style={{ margin: "0" }}>{attendanceSnapshotData && attendanceSnapshotData['EarnedLeaveBalance'] ? attendanceSnapshotData['EarnedLeaveBalance'] : "__"}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={24} sm={16} lg={6}>
                        <Card variant="borderless" size='small'>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>EL Amount</Text>
                                <Title level={5} style={{ margin: "0" }}>{attendanceSnapshotData ? formatCurrency((attendanceSnapshotData['BasicSalary_Bud_'] / 30) * attendanceSnapshotData['EarnedLeaveBalance']) : formatCurrency(0)}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={8} sm={16} lg={6}>
                        <Card variant="borderless" size='small' style={{ backgroundColor: "#eff6ff", border: "1px solid", borderColor: "#2b7fff" }}>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>TOTAL ADDITIONS</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.totalAdditions ? formatCurrency(selectedEmployee?.totalAdditions) : formatCurrency(0)}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={8} sm={16} lg={6}>
                        <Card variant="borderless" size='small' style={{ width: "100%", backgroundColor: "#fef2f2", border: "1px solid", borderColor: "#ffc9c9" }}>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>TOTAL DEDUCTIONS</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.totalDeductions ? formatCurrency(selectedEmployee?.totalDeductions) : formatCurrency(0)}</Title>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={8} sm={16} lg={6}>
                        <Card variant="borderless" size='small' style={{ width: "100%", backgroundColor: "#f0fdfa", border: "1px solid", borderColor: "#00bba7" }}>
                            <Flex vertical style={{ padding: ".5rem" }}>
                                <Text style={{ margin: "0", textTransform: "uppercase" }}>NET AMOUNT</Text>
                                <Title level={5} style={{ margin: "0" }}>{selectedEmployee?.netAmount ? formatCurrency(selectedEmployee?.netAmount) : formatCurrency(0)}</Title>
                            </Flex>
                        </Card>
                    </Col>
                </Row>
                {/* <Row gutter={8}>
          </Row> */}
            </div>
            <Form layout="vertical" onFinish={handleSubmit}>
                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <Form.Item
                            label="Sent for Payment"
                            name="sendForPaymentAmount"
                            rules={[
                                { required: true, message: 'Please enter Sent for Payment amount' },
                                decimalRule(2)
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Amount Paid"
                            name="amountPaid"
                            rules={[
                                { required: true, message: 'Please enter Amount Paid' },
                                decimalRule(2)
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Pymt. Vchr. No."
                            name="paymentVoucherNo"
                            rules={[{ required: true, message: 'Please enter Payment Voucher Number' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Remarks/Payment Details"
                            name="remarks"
                            rules={[{ required: true, message: 'Please enter remarks or payment details' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Cheque No."
                            name="chequeNo"
                            rules={[{ required: true, message: 'Please enter cheque number' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Chqeque Date"
                            name="chequeDate"
                            rules={[{ required: true, message: 'Please select cheque date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            label="Status"
                            name="status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select placeholder="Select status">
                                <Option value="pending">Pending</Option>
                                <Option value="processed">Processed</Option>
                                <Option value="reconciled">Reconciled</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item>
                    <Button htmlType="submit" variant="solid" color="primary">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </>
    )
}