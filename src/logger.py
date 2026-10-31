DEBUG = True

class Logger:
    @staticmethod
    def error(indent, message, handler=lambda: None):
        if not DEBUG:
            return
        print()
        if indent == 0:
            print(f">>> [ERROR] {message}")
        else:
            print(f"{'    '*4}[ERROR] {message}")

        handler()

    @staticmethod
    def log(indent, message, blanckline= False, label=None):
        if not DEBUG:
            return
        if(blanckline):
            print()
        
        if indent == 0:
            if label is None:
                print(f">>> {message}")
            else:
                print(f">>> [{label}] {message}")
        else:
            if label is None:
                print(f"{'    '*indent}{message}")
            else:
                print(f"{'    '*indent}[{label}] {message}")