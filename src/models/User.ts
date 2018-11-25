import crypto from 'crypto';
import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({ label: String, url: String }, { _id: false });

export type UserModel = mongoose.Document & {
  email: string;
  password: string;
  type: 'Artist' | 'Place' | 'Viewer';

  facebook: string;
  google: string;

  profile: {
    fullname: string;
    description: string;
    location: {
      type: string;
      coordinates: [number, number];
      address: string;
    };
    picture: string;
    typologies: string[];
    links: Array<{ label: string; url: string }>;
  };

  comparePassword: (candidatePassword: string) => boolean;
  gravatar: (size: number) => string;
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: 'You have already been registered with this email',
      required: 'The email address is required'
    },
    // Password is not required because user can login with Google/FB
    password: String,
    type: String,

    facebook: String,
    google: String,

    profile: {
      fullname: { type: String, trim: true },
      description: String,
      location: {
        type: { type: String, default: 'Point' },
        // Default coordinates avoid MongoDB error when creating the user
        coordinates: { type: [Number, Number], default: [0, 0] },
        address: String
      },
      picture: String,
      typologies: [String],
      links: [linkSchema]
    }
  },
  { usePushEach: true }
);

userSchema.index({
  'profile.fullname': 'text'
});

userSchema.index({
  'profile.location': '2dsphere'
});

userSchema.set('toJSON', {
  transform: function(doc, returned, options) {
    delete returned.__v;
    delete returned.password;

    return returned;
  }
});

function createHash(value: string) {
  return crypto
    .createHash('md5')
    .update(value)
    .digest('hex');
}

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = createHash(this.password);

  next();
});

userSchema.methods.comparePassword = function(candidatePassword: string) {
  const received = createHash(candidatePassword);

  return this.password === received;
};

/**
 * Helper method for getting users's gravatar.
 */
userSchema.methods.gravatar = function(size: number = 200) {
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = createHash(this.email);
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model<UserModel>('User', userSchema);
export default User;
