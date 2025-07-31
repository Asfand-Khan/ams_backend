export const getOTPTemplate = (otp: string | null, name: string) => `
<!DOCTYPE html>
<html>
<head>
<style>
      body{
        text-align: justify !important;
      }
    </style>
</head>
<body>
  <div style="margin: auto">
      <div style="width: 600px; margin: 0px auto">
        <div style="text-align: center; margin: 20px 0px; background-color: #FFFFFF; border: 1px solid #0074FC;">
          <img
            src="${process.env.ASSET_URL}/orio_logo.svg"
            alt=""
            style="width: 160px"
            class="CToWUd a6T"
            data-bit="iit"
            tabindex="0"
          />
        </div>
        <div>
          <h2
            style="
              font-size: 24px;
              color: #021527;
              font-weight: 700;
              text-align: center;
            "
          >
            Welcome to Orio!
          </h2>
          <div style="font-size: 16px; font-weight: 400; color: #354452">
            Hi <b><span style="color: #0074FC;">${name}</span></b>,

            <p>
              Welcome to Orio! We're excited to have you on board.
            </p>
            <p>
              Please use this <span class="il">OTP: </span>
              <b style="color: #0074FC">${otp}</b> to active your account.
            </p>
            <p>
              If you have any questions or need assistance, feel free to reach
              out to our support team.
            </p>
            <p>
              Thank you for your trust in our services. We are honored to
              support your community.
            </p>
            <div style="padding: 5px 0px">Best regards,</div>
            <div>Team Jubilee Retail</div>
          </div>
        </div>
      </div>
      <img
        src="https://ci3.googleusercontent.com/meips/ADKq_NZc3kAWm5qKvSd1HT0ksWTxSO8crQTVi7f9oez2WBPSvpdgmHMLeyoAGsNA3T0U6dcZkhKQysaG8NjLAsNlN-lZY47_w-xSp3ddieGNDFzIb_OY92WR9aFNME4p2Bzmnkmf30IvJms_OxWpYrNANOqE9oUcEuWNHTNbR0EofrFTb-6telCllXL3VFuXOJegHssFtHtt2ETuMDKDzANDJsMSiCQL-lVlNWhJQsySHXch5v4KES3JCZROD3TrT1LbBrF929Gry0k80jdfo9tBJpYR_9MvxEMaG5TXmxYh1TQvphvEiBT6hnfxH107U9robHMYygal7VI43zIiE4L9W1LfUx3HZxHLcGo5iFLQeSgxBqaE2UEySz5lOflJaVFDMAX8ShsukiNFfo_idCfmEHkffJN0r6053CdTTYLppxS6sXyfgeDj0pAwOg=s0-d-e1-ft#https://u48163290.ct.sendgrid.net/wf/open?upn=u001.hw4Hhi2k4hLbG50m-2BsWRFRWIVBXwVOubmn26Lz142SRK-2FGwoapRfTm-2BPA6NmvDazxeDQGQbmloFlBAit2fYjIiTfztletffHaFGRdwolVX76yn2nIgh6F-2FLrouSew6i8mOKkvL0F9-2FRwkKE9qi5m-2BLkUbvOSrKnxEc9amgZ8Mh-2BW9mL4xSKNoqoAUNmFCK8QRrdlXh-2FwPYEADuVFw3w2khKS1dhUEOU-2BkmzIfJsDO7U-3D"
        alt=""
        width="1"
        height="1"
        border="0"
        style="
          height: 1px !important;
          width: 1px !important;
          border-width: 0 !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          margin-right: 0 !important;
          margin-left: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          padding-right: 0 !important;
          padding-left: 0 !important;
        "
        class="CToWUd"
        data-bit="iit"
      />
    </div>
</body>
</html>
`;
