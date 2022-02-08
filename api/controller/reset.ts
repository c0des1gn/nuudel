import { getModelForClass } from '@typegoose/typegoose';
import { Verify } from '../service/lists/verify.resolver';
import { User, SALT_WORK_FACTOR } from '../service/lists/user.resolver';
import bcrypt from 'bcryptjs';
import { Message, info } from '../mailer/';
import { Send } from 'nuudel-main';
import { t } from '../loc/I18n';

export const Reset = async (request, reply) => {
  const { code } = request.query;
  if (!code) {
    reply.send(t('Code does not exist'));
    return;
  }

  const model = getModelForClass(Verify);
  const userModel = getModelForClass(User);

  const reset: any = await model.findOne(
    {
      $and: [
        { code: code.replace(/[^\w\s\/\=\+\.]/gi, '') },
        { userId: { $ne: '' } },
      ],
    },
    null,
    { sort: { expire: -1 } },
  );

  if (reset) {
    if (reset.expire < new Date()) {
      await model.findByIdAndDelete(reset._id);
      reply.send(t('Code is expired'));
      return;
    }
    const user = await userModel.findById(reset.userId).select('-password');
    if (user) {
      let password = Math.random()
        .toString(36)
        .substring(2);
      const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
      const reset_password = bcrypt.hashSync(password, salt);
      const update = await userModel.findByIdAndUpdate(
        user._id,
        { $set: { password: reset_password } },
        {
          new: true,
        },
      );

      if (update) {
        let email = user._verifiedEmail || user.email;
        if (!!email && email.indexOf('@') > 0) {
          Send(
            Message(
              email,
              t('Password reset successfully'),
              info(
                user.firstname || user.lastname,
                t('Your password has been successfully reset'),
                t('Your new password', { password }),
              ),
            ),
          );
          reply.send(t('Auto generated password sent to your email'));
        } else {
          reply.send(t('generated password', { password }));
        }
        await model.deleteMany({
          $or: [
            { mail: email, userId: { $ne: '' } },
            { expire: { $lt: new Date(new Date().getTime() - 86400000) } },
          ],
        });
      } else {
        reply.send(t('Reset password failed'));
      }
      return;
    } else {
      reply.send(t('User not found'));
      return;
    }
  } else {
    reply.code(500).send(t('Code not found'));
  }
};

export default Reset;
