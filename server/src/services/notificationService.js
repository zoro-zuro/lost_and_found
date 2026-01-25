const Notification = require('../models/Notification');
const { sendMail } = require('../utils/mailer');

/**
 * Notification Service
 * Handles triggering notifications (Email + In-App dual-write)
 */

class NotificationService {
  /**
   * Helper to handle dual-write logic (In-App + Email)
   */
  async _triggerNotification({ user, type, message, emailParams, relatedId, isMatch = false }) {
    const mode = process.env.NOTIFICATION_MODE || 'email';
    const emailEnabled = mode === 'email' || mode === 'both';
    const inAppEnabled = mode === 'inapp' || mode === 'both';

    let inAppResult = null;
    let emailResult = null;

    // 1. In-App Notification
    if (inAppEnabled && user._id) {
      try {
        inAppResult = await Notification.create({
          userId: user._id,
          type,
          message,
          relatedId
        });
      } catch (err) {
        console.error('In-app notification creation failed:', err);
      }
    }

    // 2. Email Notification
    if (emailEnabled && user.email && user.emailNotificationsEnabled !== false) {
      const scope = user.notifyScope || 'all';
      
      // Filter logic:
      // none -> no emails
      // block -> only matches (isMatch=true)
      // all -> everything
      
      let shouldSend = true;
      if (scope === 'none') shouldSend = false;
      if (scope === 'block' && !isMatch) shouldSend = false;

      if (shouldSend) {
        try {
          emailResult = await sendMail({
            to: user.email,
            subject: emailParams.subject,
            text: emailParams.text,
            html: emailParams.html
          });
        } catch (err) {
          console.error('Email notification failed:', err);
          emailResult = { success: false, error: err.message };
        }
      } else {
        emailResult = { success: false, reason: `Filtered by user scope: ${scope}` };
      }
    }

    return { inAppResult, emailResult };
  }

  // --- Notification Handlers ---

  async notifyLostReportPublished({ user, lostItem }) {
    return this._triggerNotification({
      user,
      type: 'REPORT_CREATED',
      message: `Your lost item report for "${lostItem.itemName}" has been published.`,
      relatedId: lostItem._id,
      emailParams: {
        subject: `Lost Report Published: ${lostItem.itemName}`,
        text: `Hello ${user.name},\n\nYour lost item report for "${lostItem.itemName}" has been successfully published on AMC Lost & Found.`,
        html: `<p>Hello <b>${user.name}</b>,</p><p>Your lost item report for "<b>${lostItem.itemName}</b>" has been successfully published on AMC Lost & Found.</p>`
      }
    });
  }

  async notifyAdminOfPrivateReport({ adminUser, user, lostItem }) {
    return this._triggerNotification({
      user: adminUser,
      type: 'REPORT_CREATED',
      message: `A private report (ADMIN_ONLY) has been created by ${user.name} for "${lostItem.itemName}".`,
      relatedId: lostItem._id,
      emailParams: {
        subject: `New Private Report: ${lostItem.itemName}`,
        text: `Hello Admin,\n\nA new private lost report has been submitted by ${user.name} (${user.email}).\nItem: ${lostItem.itemName}.\nPlease review it in the admin portal.`,
        html: `<p>Hello <b>Admin</b>,</p><p>A new private lost report has been submitted by <b>${user.name}</b> (${user.email}).</p><p><b>Item:</b> ${lostItem.itemName}</p><p>Please review it in the admin portal.</p>`
      }
    });
  }

  async notifyFoundMatch({ user, foundItem, lostItem }) {
    return this._triggerNotification({
      user,
      type: 'MATCH_FOUND',
      message: `A potential match for your lost "${lostItem.itemName}" was found: "${foundItem.itemName}"`,
      relatedId: foundItem._id,
      isMatch: true,
      emailParams: {
        subject: `Potential Match Found: ${lostItem.itemName}`,
        text: `Hello ${user.name},\n\nA potential match for your lost "${lostItem.itemName}" has been found. Item: "${foundItem.itemName}". Check it out on the dashboard.`,
        html: `<p>Hello <b>${user.name}</b>,</p><p>A potential match for your lost "<b>${lostItem.itemName}</b>" has been found.</p><p><b>Found Item:</b> ${foundItem.itemName}</p><p>Check it out on the dashboard to claim it.</p>`
      }
    });
  }

  async notifyClaimCreated({ user, item }) {
    return this._triggerNotification({
      user,
      type: 'CLAIM_REQUESTED',
      message: `You have successfully requested a claim for "${item.itemName}".`,
      relatedId: item._id,
      emailParams: {
        subject: `Claim Request Submitted: ${item.itemName}`,
        text: `Hello ${user.name},\n\nYour claim request for "${item.itemName}" has been submitted successfully and is under review.`,
        html: `<p>Hello <b>${user.name}</b>,</p><p>Your claim request for "<b>${item.itemName}</b>" has been submitted successfully and is under review.</p>`
      }
    });
  }

  async notifyClaimSubmitted({ ownerUser, foundItem, claimantUser }) {
    return this._triggerNotification({
      user: ownerUser,
      type: 'CLAIM_REQUESTED',
      message: `${claimantUser.name} has submitted a claim for your found item "${foundItem.itemName}".`,
      relatedId: foundItem._id,
      emailParams: {
        subject: `New Claim Request: ${foundItem.itemName}`,
        text: `Hello ${ownerUser.name},\n\n${claimantUser.name} has submitted a claim for the item you found: "${foundItem.itemName}". Please review it in the app.`,
        html: `<p>Hello <b>${ownerUser.name}</b>,</p><p><b>${claimantUser.name}</b> has submitted a claim for the item you found: "<b>${foundItem.itemName}</b>".</p><p>Please review it in the application.</p>`
      }
    });
  }

  async notifyClaimApproved({ claimantUser, item, pickupInstructions }) {
    return this._triggerNotification({
      user: claimantUser,
      type: 'CLAIM_APPROVED',
      message: `Your claim for "${item.itemName}" has been approved!`,
      relatedId: item._id,
      emailParams: {
        subject: `Claim Approved: ${item.itemName}`,
        text: `Hello ${claimantUser.name},\n\nGreat news! Your claim for "${item.itemName}" has been approved.\n\nPickup Instructions: ${pickupInstructions || 'Please visit the Main Office.'}`,
        html: `<p>Hello <b>${claimantUser.name}</b>,</p><p>Great news! Your claim for "<b>${item.itemName}</b>" has been approved.</p><p><b>Pickup Instructions:</b> ${pickupInstructions || 'Please visit the Main Office.'}</p>`
      }
    });
  }

  async notifyClaimRejected({ claimantUser, item }) {
    return this._triggerNotification({
      user: claimantUser,
      type: 'CLAIM_REJECTED',
      message: `Your claim for "${item.itemName}" was not approved.`,
      relatedId: item._id,
      emailParams: {
        subject: `Claim Update: ${item.itemName}`,
        text: `Hello ${claimantUser.name},\n\nWe regret to inform you that your claim for "${item.itemName}" was not approved. If you have questions, please contact the administrator.`,
        html: `<p>Hello <b>${claimantUser.name}</b>,</p><p>We regret to inform you that your claim for "<b>${item.itemName}</b>" was not approved.</p><p>If you have questions, please contact the administrator.</p>`
      }
    });
  }

  async notifyNewComment({ user, item, authorName }) {
    return this._triggerNotification({
      user,
      type: 'NEW_COMMENT',
      message: `${authorName} commented on your post "${item.itemName}".`,
      relatedId: item._id,
      emailParams: {
        subject: `New Comment on: ${item.itemName}`,
        text: `Hello ${user.name},\n\n${authorName} has left a comment on your post "${item.itemName}".`,
        html: `<p>Hello <b>${user.name}</b>,</p><p><b>${authorName}</b> has left a comment on your post "<b>${item.itemName}</b>".</p>`
      }
    });
  }
}

module.exports = new NotificationService();
