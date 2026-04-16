import React, { useState } from "react";
import { Modal, Button, Checkbox, Typography, Divider } from "antd";
import "./AcceptOfferModal.css";

const { Title, Text } = Typography;

const AcceptOfferModal = ({ visible, onAccept, onCancel, offerDetails }) => {
  const [checked, setChecked] = useState(false);

  const handleConfirm = () => {
    if (checked) {
      onAccept();
    }
  };

  return (
    <Modal
      title="Offer Letter Confirmation"
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      className="offer-modal"
    >
      <div className="offer-content">
        <Title level={4}>Congratulations! 🎉</Title>
        <Text className="offer-text">
          You have been offered the position of <b>{offerDetails.position}</b> at <b>{offerDetails.company}</b>.
        </Text>
        <Text className="offer-text">
          Start Date: <b>{offerDetails.startDate}</b>
        </Text>
        <Text className="offer-text">
          Location: <b>{offerDetails.location}</b>
        </Text>

        <Divider />

        <Checkbox onChange={(e) => setChecked(e.target.checked)}>
          I accept the terms and conditions mentioned in the offer letter.
        </Checkbox>

        <div className="offer-actions">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            disabled={!checked}
            onClick={handleConfirm}
          >
            Accept Offer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AcceptOfferModal;
