import { getModelForClass } from '@typegoose/typegoose';
import { Verify } from '../service/lists/verify.resolver';
import { User } from '../service/lists/user.resolver';
import { UserStatus } from '../service/enums';
import { t } from '../loc/I18n';

export const Verification = async (request, reply) => {
  const { code, email } = request.query;
  if (!code) {
    reply.send(t('Code does not exist'));
    return;
  }

  const model = getModelForClass(Verify);
  const userModel = getModelForClass(User);

  const verify: any = await model.findOne(
    {
      $and: [
        { code: code.replace(/[^\w\s\/\=\+\.]/gi, '') },
        { mail: email.replace(/[^\w\s\.\_\@\-]/gi, '') },
      ],
    },
    null,
    { sort: { expire: -1 } },
  );

  if (verify) {
    if (verify.expire < new Date()) {
      reply.send(t('Code is expired'));
      await model.findByIdAndDelete(verify._id);
      return;
    }

    const user = !verify.userId
      ? await userModel.findOne({ email: verify.mail })
      : await userModel.findById(verify.userId).select('-password');

    if (user) {
      if (verify.mail === user._verifiedEmail) {
        reply.send(t('Email Already Verified'));
        await model.findByIdAndDelete(verify._id);
        return;
      } else {
        const update = await userModel.findByIdAndUpdate(
          user._id,
          {
            $set: !verify.userId
              ? { _verifiedEmail: verify.mail, _status: UserStatus.Active }
              : {
                  email: verify.mail,
                  _verifiedEmail: verify.mail,
                  _status:
                    user._status !== UserStatus.Blocked
                      ? UserStatus.Active
                      : UserStatus.Blocked,
                },
          },
          {
            new: true,
          },
        );
        if (update) {
          reply.send(t('verify mail', { email: verify.mail }));
          await model.deleteMany({
            $or: [
              { userId: verify.userId, mail: verify.mail },
              { expire: { $lt: new Date(new Date().getTime() - 86400000) } },
            ],
          });
        } else {
          reply.send(t('Verification failed'));
        }
        return;
      }
    } else {
      reply.send(t('Email not found'));
      return;
    }
  } else {
    reply.send(t('Code not found'));
  }
  return;
};
export default Verification;
