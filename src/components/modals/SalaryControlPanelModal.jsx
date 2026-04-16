import React, { useState, useRef } from "react";
import { Modal } from "antd";
import Draggable from "react-draggable";
import SalaryEditControlPanel from "../payroll/salaryControlPanal/SalaryControlHome"; // Adjust the path if needed
import './salrycontrolpanal.css'
const SalaryControlPanelModal = ({
  salarySlipControlPanal,
  setsalarySlipControlPanal,
}) => {
  const [disabled, setDisabled] = useState(true);
  const draggleRef = useRef(null);

  return (
    <Modal
      open={salarySlipControlPanal}
      onCancel={setsalarySlipControlPanal}
      footer={null}
      closable={false}
      width={1200}
      centered
      className="mod_salry"
      bodyStyle={{ padding: 0 }}
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          handle=".mod_salry-title"
          nodeRef={draggleRef}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
      title={
        <div
          className="mod_salry-title"
          style={{ cursor: "move", width: "100%" }}
          onMouseOver={() => setDisabled(false)}
          onMouseOut={() => setDisabled(true)}
        >
          Salary Control Panel
        </div>
      }
    >
      <SalaryEditControlPanel setsalarySlipControlPanal={setsalarySlipControlPanal} />
    </Modal>
  );
};

export default SalaryControlPanelModal;
