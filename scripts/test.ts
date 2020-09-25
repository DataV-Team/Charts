import open from 'open'
import { fileForEach } from '@jiaminghi/fs'

fileForEach('./test/function', _ => open(_))
