interface IProps {
  label: string;
  secondary?: boolean;
  fullWidth?: boolean;
  large?: boolean;
  onClick: () => void;
  disabled?: boolean;
  outline?: boolean;
}

const Button = ({ label, secondary, fullWidth, onClick, large, disabled, outline }: IProps) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
      disabled:opacity-70
      disabled:cursor-not-allowed
      rounded-full
      font-semibold
      hover:opacity-80
      transition
      border-2
      ${fullWidth ? "w-full" : "w-fit"}
      ${secondary ? "bg-white" : "bg-sky-500"}
      ${secondary ? "text-gray-500" : "text-white"}
      ${secondary ? "border-gray-400" : "border-sky-500"}
      ${large ? "text-xl" : "text-md"}
      ${large ? "px-5" : "px-4"}
      ${large ? "py-3" : "py-2"}
      ${outline ? "bg-transparent" : ""}
      ${outline ? "border-sky-500" : ""}
      ${outline ? "text-red-500" : ""}
  `}
    >
      {label}
    </button>
  );
};

export default Button;
